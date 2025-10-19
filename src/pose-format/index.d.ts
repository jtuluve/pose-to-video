
import { PoseHeaderModel, PoseBodyModel } from "../renderers/types";

declare class Pose {
    header: PoseHeaderModel;
    body: PoseBodyModel;

    constructor(header: PoseHeaderModel, body: PoseBodyModel);

    static from(buffer: Buffer): Pose;

    static fromLocal(path: string): Promise<Pose>;

    static fromRemote(url: string, abortController?: AbortController): Promise<Pose>;
}

export { Pose };
