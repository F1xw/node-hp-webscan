## About

Some HP printers include the webscan protocol. This client can be used to interact with this protocol and request scans from a printer on your local network.

Only tested with **HP Envy 6432e**.

## Setup your printer

In my case, the webscan function of my printer had to be enabled in the webinterface.

For the HP Envy 6432e the setting is located at **_Settings > Security > Administrator Settings_**. Check the box next to "Webscan from EWS" and save the changes.

## Installation

```bash
npm install hp-webscan-client
```

## Usage

```js
import { WebScan } from "hp-webscan-client";

// Create a new WebScan instance
const client = new WebScan({
    ip: "PRINTER_IP",
});

// Start scanning process and save file to output.pdf
client.scanToFile({
    color: true,
    output: {
        format: "application/pdf",
        path: "output.pdf",
    },
});

// Start scanning process and return document as buffer
const buffer = client.scanToBuffer({
    color: true,
    format: "application/pdf",
});
```

## Properties

### IScanDocumentOptions

| Key        | Type        | Description                                                                                                                 | Required | Default |
| ---------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| color      | boolean     | Set to true for a color scan and false for grayscale                                                                        | yes      | none    |
| source     | string      | Choose between "Platen" and "Feeder" where Platen is the glass scanning surface and Feeder is the automatic document feeder | no       | Platen  |
| output     | IScanOutput | Specified the content type and path                                                                                         | yes      | none    |
| resolution | int         | Sets the resolution of the scanned document. Lower will be faster. Fixed to 85 when Feeder is set as source.                | no       | 300     |
| brightness | int         | The brightness of the scan                                                                                                  | false    | 1000    |
| contrast   | int         | The contrast of the scan                                                                                                    | false    | 1000    |

### IScanDocumentBufferOptions

| Key        | Type    | Description                                                                                                                 | Required | Default |
| ---------- | ------- | --------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| color      | boolean | Set to true for a color scan and false for grayscale                                                                        | yes      | none    |
| source     | string  | Choose between "Platen" and "Feeder" where Platen is the glass scanning surface and Feeder is the automatic document feeder | no       | Platen  |
| format     | string  | Specified the content type. Choose between "application/pdf" and "image/jpeg"                                               | yes      | none    |
| resolution | int     | Sets the resolution of the scanned document. Lower will be faster. Fixed to 85 when Feeder is set as source.                | no       | 300     |
| brightness | int     | The brightness of the scan                                                                                                  | false    | 1000    |
| contrast   | int     | The contrast of the scan                                                                                                    | false    | 1000    |

### IScanOutput

| Key    | Type   | Description                                                                   | Required | Default |
| ------ | ------ | ----------------------------------------------------------------------------- | -------- | ------- |
| format | string | Specified the content type. Choose between "application/pdf" and "image/jpeg" | yes      | none    |
| path   | string | Path that the scanned document will be saved at                               | yes      | none    |

## WebScan Class

### Functions

-   scanToFile

```js
scanToFile(options: IScanDocumentOptions): Promise<void>
```

This function will initiate a scan and save the scanned document to a local file.

-   scanToBuffer

```js
scanToBuffer(options: IScanDocumentBufferOptions): Promise<Buffer>
```

This function will initiate a scan and return the scanned document as a buffer.
