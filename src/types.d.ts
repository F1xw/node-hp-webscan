export interface IScanRegion {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
}

export interface IScanOutput {
    format: "application/pdf" | "image/jpeg";
    path: string;
}