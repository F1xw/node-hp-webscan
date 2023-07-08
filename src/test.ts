import { WebScan } from "./WebScan";

const scanner = new WebScan({
    deviceInfo: {
        ip: "192.168.2.77"
    }
});

scanner.scanToFile({
    source: "Feeder",
    color: true,
    output: {
        format: "application/pdf",
        path: "test123.pdf"
    },
    resolution: "75"
}).then(() => {
    console.log("Done");
})