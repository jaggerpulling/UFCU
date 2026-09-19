import type { FaceLandmarker, FaceLandmarkerResult } from "@mediapipe/tasks-vision";

export const challenges = ["center_face", "turn_left", "turn_right", "blink"] as const;
export type LivenessChallenge = (typeof challenges)[number];
export type FaceNotice = "no_face" | "multiple_faces" | "move_to_center" | "tracking";

export interface LivenessProgress {
  current: LivenessChallenge | null;
  completed: LivenessChallenge[];
  notice: FaceNotice;
}

export async function createFaceLandmarker(): Promise<FaceLandmarker> {
  const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
  const assetRoot = `${import.meta.env.BASE_URL}mediapipe/`;
  const fileset = await FilesetResolver.forVisionTasks(`${assetRoot}wasm`);
  return FaceLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: `${assetRoot}face_landmarker.task` },
    runningMode: "VIDEO",
    numFaces: 2,
    outputFaceBlendshapes: true,
  });
}

export class LivenessTracker {
  private index = 0;
  private holdSince: number | null = null;
  private neutralYaw: number | null = null;
  private blinkPhase: "open" | "closed" = "open";
  private closedAt: number | null = null;

  update(result: FaceLandmarkerResult, now: number): LivenessProgress {
    const completed = () => challenges.slice(0, this.index) as LivenessChallenge[];
    const current = () => challenges[this.index] ?? null;
    const faceCount = result.faceLandmarks.length;

    if (faceCount !== 1) {
      this.resetCurrentObservation();
      return {
        current: current(),
        completed: completed(),
        notice: faceCount === 0 ? "no_face" : "multiple_faces",
      };
    }

    const landmarks = result.faceLandmarks[0];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const nose = landmarks[1];
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];
    if (!leftEye || !rightEye || !nose || !leftCheek || !rightCheek) {
      this.resetCurrentObservation();
      return { current: current(), completed: completed(), notice: "tracking" };
    }

    const eyeWidth = rightEye.x - leftEye.x;
    const faceWidth = rightCheek.x - leftCheek.x;
    if (eyeWidth < 0.08 || faceWidth < 0.14) {
      this.resetCurrentObservation();
      return { current: current(), completed: completed(), notice: "move_to_center" };
    }

    const yaw = (nose.x - leftEye.x) / eyeWidth;
    const faceCenter = (leftCheek.x + rightCheek.x) / 2;
    const centered = faceCenter > 0.32 && faceCenter < 0.68 && yaw > 0.39 && yaw < 0.61;
    const challenge = current();

    if (challenge === "center_face") {
      if (this.hold(centered, now, 650)) {
        this.neutralYaw = yaw;
        this.advance();
      }
    } else if (challenge === "turn_left") {
      // In the unmirrored camera image, turning to the person's left shifts the nose right.
      if (this.hold(yaw > (this.neutralYaw ?? 0.5) + 0.10, now, 400)) this.advance();
    } else if (challenge === "turn_right") {
      if (this.hold(yaw < (this.neutralYaw ?? 0.5) - 0.10, now, 400)) this.advance();
    } else if (challenge === "blink") {
      const scores = result.faceBlendshapes[0]?.categories ?? [];
      const leftBlink = scores.find((category) => category.categoryName === "eyeBlinkLeft")?.score ?? 0;
      const rightBlink = scores.find((category) => category.categoryName === "eyeBlinkRight")?.score ?? 0;
      if (this.blinkPhase === "open" && leftBlink > 0.55 && rightBlink > 0.55) {
        this.blinkPhase = "closed";
        this.closedAt = now;
      } else if (this.blinkPhase === "closed") {
        if (this.closedAt !== null && now - this.closedAt > 1500) {
          this.blinkPhase = "open";
          this.closedAt = null;
        } else if (leftBlink < 0.25 && rightBlink < 0.25) {
          this.advance();
        }
      }
    }

    return {
      current: current(),
      completed: completed(),
      notice: centered || challenge !== "center_face" ? "tracking" : "move_to_center",
    };
  }

  private hold(condition: boolean, now: number, duration: number) {
    if (!condition) {
      this.holdSince = null;
      return false;
    }
    if (this.holdSince === null) this.holdSince = now;
    return now - this.holdSince >= duration;
  }

  private advance() {
    this.index += 1;
    this.resetCurrentObservation();
  }

  private resetCurrentObservation() {
    this.holdSince = null;
    this.blinkPhase = "open";
    this.closedAt = null;
  }
}
