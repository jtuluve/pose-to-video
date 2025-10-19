
import { Viewer, PosePointModel, RGBColor, PoseLimb, PoseBodyFrameModel } from './types';

declare class PoseRenderer {
    viewer: Viewer;

    constructor(viewer: Viewer);

    x(v: number): number;

    y(v: number): number;

    isJointValid(joint: PosePointModel): boolean;

    renderJoint(i: number, joint: PosePointModel, color: RGBColor, avgZ?: number): void;

    renderJoints(joints: PosePointModel[], colors: RGBColor[], name: string): void[];

    renderLimb(from: PosePointModel, to: PosePointModel, color: RGBColor): void;

    renderLimbs(limbs: PoseLimb[], joints: PosePointModel[], colors: RGBColor[], name: string): void[];

    renderFrame(frame: PoseBodyFrameModel): void;

    render(frame: PoseBodyFrameModel): void;
}

export = PoseRenderer;
