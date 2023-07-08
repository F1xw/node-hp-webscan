import { writeFileSync } from "node:fs";
import { DOMParser } from "@xmldom/xmldom";
import { IScanDocumentBufferOptions, IScanDocumentOptions, IWebScanOptions } from "./types";

export class WebScan {
    private options: IWebScanOptions;

    constructor(options: IWebScanOptions) {
        this.options = options;
    }

    private async getLatestScanUrl(): Promise<string | null> {
        try {
            const req = await fetch(
                `http://${this.options?.ip}/eSCL/ScannerStatus`,
                {
                    method: "GET",
                }
            );
            if (req.status !== 200) {
                throw new Error(`Expected status code 200 but got ${req.status} instead while requesting the latest scan job URL.`)
            }
            const xmlTree = new DOMParser().parseFromString(
                await req.text(),
                "text/xml"
            );
            return xmlTree
                .getElementsByTagName("scan:JobInfo")[0]
                .getElementsByTagName("pwg:JobUri")[0].textContent;
        } catch (error) {
            throw new Error("An error occurred while requesting the latest scan job URL.")
        }
    }

    private async getDocumentBuffer(scanUrl: string): Promise<Buffer> {
        try {
            const req = await fetch(
                `http://${this.options?.ip}${scanUrl}/NextDocument`,
                {
                    method: "GET",
                }
            );
            if (req.status !== 200) {
                throw new Error(`Expected response code 200 but got ${req.status} instead while downloading the document.`)
            }
            return Buffer.from(await req.arrayBuffer());
        } catch (error) {
            throw new Error("An error occurred while downloading the scanned document.")
        }
    }

    private async requestScanJob(
        options: IScanDocumentOptions
    ): Promise<boolean> {
        try {
            const req = await fetch(
                `http://${this.options?.ip}/eSCL/ScanJobs`,
                {
                    method: "POST",
                    body: scanSettings(options),
                }
            );
            if (req.status !== 201) {
                throw new Error(
                    `Expected response code 201 but got ${req.status} instead when requesting scan job.`
                );
            }
        } catch (error) {
            throw new Error(`An error occurred while requesting the scan job.`);
        }
        return true;
    }

    async scanToBuffer(options: IScanDocumentBufferOptions): Promise<Buffer | null> {
        await this.requestScanJob({...options, output:{format: options.format, path: ""}});
        const scanJob = await this.getLatestScanUrl();
        if (!scanJob) {
            throw new Error(
                "An error occurred while requesting the document from the printer."
            );
        }
        const document = await this.getDocumentBuffer(scanJob);
        return document;
    }

    async scanToFile(options: IScanDocumentOptions): Promise<void> {
        await this.requestScanJob(options);
        const scanJob = await this.getLatestScanUrl();
        if (!scanJob) {
            throw new Error(
                "An error occurred while requesting the document from the printer."
            );
        }
        const document = await this.getDocumentBuffer(scanJob);
        if (!document) {
            throw new Error(
                "There was an error while receiving the scanned document."
            );
        }

        writeFileSync(options.output.path, document);
    }
}

const scanSettings = (options: IScanDocumentOptions) =>
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
<scan:DocumentFormatExt>${
        options.source === "Feeder"
            ? "application/pdf"
            : options.output.format || "application/pdf"
    }</scan:DocumentFormatExt>
<scan:XResolution>${options.source === "Platen" ? options.resolution || 300 : "85"}</scan:XResolution>
<scan:YResolution>${options.source === "Platen" ? options.resolution || 300 : "85"}</scan:YResolution>
<scan:ColorMode>${options.color ? "RGB24" : "Grayscale8"}</scan:ColorMode>
<scan:CompressionFactor>25</scan:CompressionFactor>
<scan:Brightness>${options.brightness || 1000}</scan:Brightness>
<scan:Contrast>${options.contrast || 1000}</scan:Contrast>
</scan:ScanSettings>`;
