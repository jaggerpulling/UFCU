import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";

import { routePaths } from "@/app/routes";
import { Button } from "@/components";
import {
  challenges,
  createFaceLandmarker,
  LivenessTracker,
  type LivenessProgress,
} from "@/features/liveness/face-landmarker";
import {
  buildSocureLivenessSubmissionRequest,
  socureVerificationProvider,
  type SocureLivenessImage,
} from "@/features/identity/socure-verification";
import {
  clearDemoLivenessResult,
  getPassportResult,
  saveDemoLivenessResult,
} from "@/features/profile/member-profile";

type ViewState = "ready" | "loading" | "active" | "submitting" | "complete" | "error";

const challengeLabels = {
  center_face: "Center your face",
  turn_left: "Turn your head left",
  turn_right: "Turn your head right",
  blink: "Blink once",
} as const;

const initialProgress: LivenessProgress = {
  current: challenges[0],
  completed: [],
  notice: "tracking",
};

export function LivenessPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const frameRef = useRef<number | null>(null);
  const livenessImagesRef = useRef<SocureLivenessImage[]>([]);
  const runIdRef = useRef(0);
  const [viewState, setViewState] = useState<ViewState>("ready");
  const [progress, setProgress] = useState<LivenessProgress>(initialProgress);
  const [errorMessage, setErrorMessage] = useState("");
  const [biometricConsent, setBiometricConsent] = useState(false);

  const stopCheck = useCallback(() => {
    runIdRef.current += 1;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
  }, []);

  useEffect(() => {
    clearDemoLivenessResult();
    window.addEventListener("pagehide", stopCheck);
    return () => {
      window.removeEventListener("pagehide", stopCheck);
      livenessImagesRef.current = [];
      stopCheck();
    };
  }, [stopCheck]);

  async function startCheck() {
    stopCheck();
    clearDemoLivenessResult();
    livenessImagesRef.current = [];
    const runId = runIdRef.current;
    setProgress(initialProgress);
    setErrorMessage("");
    setViewState("loading");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is unavailable in this browser or connection.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user" },
      });
      if (runId !== runIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error("Camera preview could not start.");
      video.srcObject = stream;
      await video.play();
      if (runId !== runIdRef.current) return;

      const landmarker = await createFaceLandmarker();
      if (runId !== runIdRef.current) {
        landmarker.close();
        return;
      }
      landmarkerRef.current = landmarker;
      setViewState("active");

      const tracker = new LivenessTracker();
      let completedChallengeCount = 0;
      let lastVideoTime = -1;
      let lastCheckAt = 0;

      const checkFrame = (now: number) => {
        if (runId !== runIdRef.current) return;
        try {
          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
              video.currentTime !== lastVideoTime &&
              now - lastCheckAt >= 100) {
            lastVideoTime = video.currentTime;
            lastCheckAt = now;
            const result = landmarker.detectForVideo(video, now);
            const nextProgress = tracker.update(result, now);
            setProgress(nextProgress);

            if (nextProgress.completed.length > completedChallengeCount) {
              const challenge = nextProgress.completed[completedChallengeCount];
              const imageData = captureLivenessFrame(video);
              if (!challenge || !imageData) throw new Error("Unable to capture liveness evidence.");
              livenessImagesRef.current.push({ challenge, imageData });
              completedChallengeCount = nextProgress.completed.length;
            }

            if (nextProgress.current === null && nextProgress.completed.length === challenges.length) {
              stopCheck();
              setViewState("submitting");
              void submitLivenessEvidence();
              return;
            }
          }
          frameRef.current = requestAnimationFrame(checkFrame);
        } catch {
          livenessImagesRef.current = [];
          stopCheck();
          setErrorMessage("The demo liveness check stopped. Please try again.");
          setViewState("error");
        }
      };
      frameRef.current = requestAnimationFrame(checkFrame);
    } catch (error) {
      if (runId !== runIdRef.current) return;
      livenessImagesRef.current = [];
      stopCheck();
      setErrorMessage(cameraErrorMessage(error));
      setViewState("error");
    }
  }

  async function submitLivenessEvidence() {
    const identity = getPassportResult();
    const images = livenessImagesRef.current;
    try {
      if (!identity || images.length !== challenges.length) {
        throw new Error("Liveness evidence is incomplete.");
      }
      await socureVerificationProvider.submitLivenessImages(
        buildSocureLivenessSubmissionRequest(identity, images),
      );
      // Drop all references immediately after the provider handoff. Do not persist
      // images in sessionStorage, localStorage, state, logs, or analytics.
      livenessImagesRef.current = [];
      saveDemoLivenessResult({
        status: "verified_demo",
        method: "webcam_liveness",
        completedChallenges: [...challenges],
        completedAt: new Date().toISOString(),
      });
      setViewState("complete");
    } catch {
      livenessImagesRef.current = [];
      setErrorMessage("We couldn’t securely send your liveness images. No images were retained. Please try again.");
      setViewState("error");
    }
  }

  function continueWithoutCamera() {
    clearDemoLivenessResult();
    stopCheck();
    navigate(routePaths.school);
  }

  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-mute">
          Identity · Demo step 2
        </p>
        <h1 className="mt-3 font-display text-display-md text-primary">
          {viewState === "complete" ? "Demo liveness check complete" : "Check your live presence"}
        </h1>
        <p className="mt-3 text-body-md text-body">
          {viewState === "complete"
            ? "You completed the camera challenges for this demo."
            : "Use your camera to follow four quick prompts. Completion images are highly sensitive biometric data and will be sent through our backend to Socure for liveness verification."}
        </p>

        {viewState !== "complete" ? (
          <>
            <div className="relative mt-6 aspect-[4/5] max-h-[28rem] overflow-hidden rounded-lg bg-primary">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                aria-label="Live camera preview"
                className={`h-full w-full scale-x-[-1] object-cover ${viewState === "ready" || viewState === "error" ? "opacity-0" : ""}`}
              />
              {viewState === "ready" || viewState === "error" ? (
                <div className="absolute inset-0 grid place-items-center px-6 text-center text-white">
                  <p>Your live camera preview will appear here.</p>
                </div>
              ) : null}
              {viewState === "loading" ? (
                <div className="absolute inset-x-4 bottom-4 rounded-md bg-primary/85 p-3 text-center text-white">
                  Starting camera and face tracking…
                </div>
              ) : null}
            </div>

            {viewState === "active" ? (
              <div className="mt-5 rounded-lg bg-canvas-soft p-4" aria-live="polite">
                <p className="text-caption font-semibold uppercase tracking-[0.12em] text-mute">
                  {progress.completed.length + 1} of {challenges.length}
                </p>
                <p className="mt-1 font-display text-display-sm text-primary">
                  {progress.current ? challengeLabels[progress.current] : ""}
                </p>
                <p className="mt-2 text-body-sm text-body">{noticeText(progress.notice)}</p>
              </div>
            ) : null}

            {viewState === "error" ? (
              <p className="mt-4 rounded-md bg-negative-subtle p-3 text-body-sm text-negative" role="alert">
                {errorMessage}
              </p>
            ) : null}
            <p className="mt-4 text-caption text-mute">
              Only one image per completed challenge is captured. Images are highly sensitive biometric data, held only in memory for this session, sent over the secure provider connection to Socure, and never saved by this app.
            </p>
            {viewState === "ready" || viewState === "error" ? (
              <label className="mt-4 flex gap-3 rounded-md bg-canvas-soft p-4 text-body-sm text-body">
                <input
                  type="checkbox"
                  checked={biometricConsent}
                  onChange={(event) => setBiometricConsent(event.target.checked)}
                  className="mt-0.5 size-4 accent-secondary"
                />
                <span>I consent to sharing these highly sensitive biometric liveness images with Socure for liveness verification.</span>
              </label>
            ) : null}
          </>
        ) : (
          <div className="mt-8 rounded-lg border-2 border-secondary bg-secondary-subtle p-6 text-center">
            <span className="text-4xl text-positive" aria-hidden="true">✓</span>
            <p className="mt-3 font-semibold text-primary">All four demo challenges completed</p>
            <p className="mt-2 text-body-sm text-body">Your liveness images were sent to Socure and were not stored by this app.</p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4">
        {viewState === "complete" ? (
          <Button fullWidth onClick={() => navigate(routePaths.school)}>Continue</Button>
        ) : (
          <>
            {(viewState === "ready" || viewState === "error") ? (
              <Button fullWidth onClick={startCheck} disabled={!biometricConsent}>
                {viewState === "error" ? "Try camera again" : "Start camera"}
              </Button>
            ) : null}
            {viewState === "submitting" ? (
              <p className="text-center text-body-sm text-body" aria-live="polite">Securely sending highly sensitive liveness images to Socure…</p>
            ) : null}
            <Button className="mt-3" variant="secondary" fullWidth onClick={continueWithoutCamera}>
              Continue demo without camera
            </Button>
          </>
        )}
      </div>
    </section>
  );
}

function captureLivenessFrame(video: HTMLVideoElement): string | null {
  const maxDimension = 640;
  const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
  const width = Math.max(1, Math.round(video.videoWidth * scale));
  const height = Math.max(1, Math.round(video.videoHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(video, 0, 0, width, height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
  const [, base64] = dataUrl.split(",", 2);
  return base64 ?? null;
}

function noticeText(notice: LivenessProgress["notice"]) {
  if (notice === "no_face") return "No face found. Move into the frame and improve the lighting.";
  if (notice === "multiple_faces") return "More than one face found. Continue when only you are in frame.";
  if (notice === "move_to_center") return "Move your face toward the center of the preview.";
  return "Keep only your face in frame and follow the prompt.";
}

function cameraErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      return "Camera access was denied. Allow camera access in your browser settings, then try again.";
    }
    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      return "No camera was found on this device.";
    }
    if (error.name === "NotReadableError" || error.name === "TrackStartError") {
      return "The camera is in use or could not be started. Close other camera apps and try again.";
    }
  }
  return error instanceof Error ? error.message : "The camera check could not start. Please try again.";
}
