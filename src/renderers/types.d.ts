
export interface RGBColor {
    R: number;
    G: number;
    B: number;
}

export interface PoseLimb {
    from: number;
    to: number;
}

export interface PosePointModel {
    X: number;
    Y: number;
    Z?: number;
    C?: number;
}

export interface PoseHeaderComponentModel {
    name: string;
    format: string;
    _points: number;
    _limbs: number;
    _colors: number;
    points: string[];
    limbs: PoseLimb[];
    colors: RGBColor[];
}

export interface PoseHeaderModel {
    version: number;
    width: number;
    height: number;
    depth: number;
    _components: number;
    components: PoseHeaderComponentModel[];
    headerLength: number;
}

export type PoseBodyFramePersonModel = {
    [key: string]: PosePointModel[];
};

export interface PoseBodyFrameModel {
    _people: number;
    people: PoseBodyFramePersonModel[];
}

export interface PoseBodyModel {
    fps: number;
    _frames: number;
    frames: PoseBodyFrameModel[];
}

export interface PoseModel {
    header: PoseHeaderModel;
    body: PoseBodyModel;
}

export interface Viewer {
    width: number;
    height: number;
    pose: PoseModel;
}
