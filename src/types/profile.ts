export interface Point {
    x: number;
    y: number;
}

export interface IndexedPoint extends Point {
    index: number;
}

export interface ProfileMetadata {
    share_token?: string;
    short_id?: string;
    origin?: string;
    farm?: string;
    spare?: string;
    zero?: number;
}

export type RoastStage =
    | "YELLOWING"
    | "FIRST_CRACK"
    | "DEVELOPMENT"
    | "COOL_DOWN"
    | "UNKNOWN";

export interface RoastMarker {
    time_raw: number;
    label: string;
    stage: RoastStage;
}

export interface IkawaProfile {
    version: number;
    profile_name: string;
    device_token?: string;
    curve_points: Point[];
    annotations: Point[];
    meta_points: Point[];
    metadata: ProfileMetadata;
    roast_markers?: RoastMarker[];
    _cooldownMinEnforced?: boolean;
}
