
import { Pose } from "./pose-format";
import { CanvasPoseRenderer } from "./renderers/canvas.pose-renderer";
import { PoseModel } from "./renderers/types";

export function cleanPoseJson(pose: PoseModel): PoseModel | null;

export function generateFrames(pose: PoseModel, renderer: CanvasPoseRenderer): void;

export function combineFramesToVideo(fps: number, outputPath: string, padLength?: number): Promise<void>;

export function processPose(pose: PoseModel, outputPath: string): Promise<boolean>; 

export function poseToVideo(posePath: string, outputPath: string): Promise<boolean>;

export function poseJsonToVideo(pose: PoseModel, outputPath: string): Promise<boolean>;
