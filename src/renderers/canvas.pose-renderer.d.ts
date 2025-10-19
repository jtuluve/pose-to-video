
import { Canvas, CanvasRenderingContext2D } from 'canvas';
import PoseRenderer = require('./pose-renderer');
import { Viewer, PosePointModel, PoseBodyFrameModel, RGBColor } from './types';

declare class CanvasPoseRenderer extends PoseRenderer {
    canvas: Canvas;
    ctx: CanvasRenderingContext2D;
    thickness: number;

    constructor(viewer: Viewer);

    x(v: number): number;

    y(v: number): number;

    isJointValid(joint: PosePointModel): boolean;

    renderJoint(_: any, joint: PosePointModel, color: RGBColor): void;

    renderLimb(from: PosePointModel, to: PosePointModel, color: RGBColor): void;

    renderFrame(frame: PoseBodyFrameModel): void;

    render(frame: PoseBodyFrameModel): Canvas;
}

export { CanvasPoseRenderer };
