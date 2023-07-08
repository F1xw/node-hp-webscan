import {writeFileSync} from "node:fs";
import { DOMParser } from "@xmldom/xmldom";

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

interface IDeviceInfo {
    ip: string;
}

export interface IWebScanOptions {
    deviceInfo: IDeviceInfo;
}

export interface IScanDocumentOptions {
    region?: IScanRegion;
    source?: "Platen" | "Feeder";
    output: IScanOutput;
    resolution?: "75" | "200" | "300" | "600";
    color: boolean;
    brightness?: 1000 | number;
    contrast?: 1000 | number;
}

export class WebScan {
    private deviceInfo: IDeviceInfo;

    constructor(options: IWebScanOptions) {
        this.deviceInfo = options.deviceInfo;
    }

    async scanToFile(options: IScanDocumentOptions): Promise<boolean> {
        try {
            const req = await fetch(
                `http://${this.deviceInfo?.ip}/eSCL/ScanJobs`,
                {
                    method: "POST",
                    body: tmpScanSettings(options),
                }
            );
            if (req.status !== 201) {
                console.log("Error while requesting scan.");
                return false;
            }
        } catch (error) {
            console.log("Error while requesting scan.");
            console.log(error);
            return false;
        }

        let scanJob;
        try {
            const req = await fetch(
                `http://${this.deviceInfo?.ip}/eSCL/ScannerStatus`,
                {
                    method: "GET",
                }
            );
            if (req.status !== 200) {
                console.log("Error while fetching scan status.");
                return false;
            }
            const xmlTree = new DOMParser().parseFromString(
                await req.text(),
                "text/xml"
            );
            scanJob = xmlTree
                .getElementsByTagName("scan:JobInfo")[0]
                .getElementsByTagName("pwg:JobUri")[0].textContent;
        } catch (error) {
            console.log("Error while fetching scan status.");
            console.log(error);
            return false;
        }

        try {
            const req = await fetch(
                `http://${this.deviceInfo?.ip}${scanJob}/NextDocument`,
                {
                    method: "GET",
                }
            );
            if (req.status !== 200) {
                console.log("Error while downloading document.");
                return false;
            }
            writeFileSync(
                options.output.path,
                Buffer.from(await req.arrayBuffer())
            );
            return true;
        } catch (error) {
            console.log("Error while downloading document.");
            console.log(error);
            return false;
        }
    }
}

const tmpScanSettings = (options: IScanDocumentOptions) =>
    `<scan:ScanSettings xmlns:scan="http://schemas.hp.com/imaging/escl/2011/05/03" xmlns:copy="http://www.hp.com/schemas/imaging/con/copy/2008/07/07" xmlns:dd="http://www.hp.com/schemas/imaging/con/dictionaries/1.0/" xmlns:dd3="http://www.hp.com/schemas/imaging/con/dictionaries/2009/04/06" xmlns:fw="http://www.hp.com/schemas/imaging/con/firewall/2011/01/05" xmlns:scc="http://schemas.hp.com/imaging/escl/2011/05/03" xmlns:pwg="http://www.pwg.org/schemas/2010/12/sm">
<pwg:Version>2.1</pwg:Version>
<scan:Intent>Document</scan:Intent>
<pwg:ScanRegions>
    <pwg:ScanRegion>
        <pwg:Height>${options.region?.height || 3507}</pwg:Height>
        <pwg:Width>${options.region?.width || 2481}</pwg:Width>
        <pwg:XOffset>${options.region?.offsetX || 0}</pwg:XOffset>
        <pwg:YOffset>${options.region?.offsetY || 0}</pwg:YOffset>
    </pwg:ScanRegion>
</pwg:ScanRegions>
<pwg:InputSource>${options.source || "Platen"}</pwg:InputSource>
<scan:DocumentFormatExt>${options.source === "Feeder" ? "application/pdf" : options.output.format || "application/pdf"}</scan:DocumentFormatExt>
<scan:XResolution>${options.resolution || 300}</scan:XResolution>
<scan:YResolution>${options.resolution || 300}</scan:YResolution>
<scan:ColorMode>${options.color ? "RGB24" : "BW"}</scan:ColorMode>
<scan:CompressionFactor>25</scan:CompressionFactor>
<scan:Brightness>${options.brightness || 1000}</scan:Brightness>
<scan:Contrast>${options.contrast || 1000}</scan:Contrast>
</scan:ScanSettings>`;
