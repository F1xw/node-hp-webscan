interface IScanRegion {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
}

interface IScanOutput {
    format: "application/pdf" | "image/jpeg";
    path: string;
}

export interface IWebScanOptions {
    ip: string;
}

export interface IScanDocumentOptions {
    region?: IScanRegion;
    source?: "Platen" | "Feeder";
    output: IScanOutput;
    resolution?: 75 | 200 | 300 | 600;
    color: boolean;
    brightness?: 1000 | number;
    contrast?: 1000 | number;
}

export interface IScanDocumentBufferOptions {
    region?: IScanRegion;
    source?: "Platen" | "Feeder";
    format: "application/pdf" | "image/jpeg";
    resolution?: 75 | 200 | 300 | 600;
    color: boolean;
    brightness?: 1000 | number;
    contrast?: 1000 | number;
}