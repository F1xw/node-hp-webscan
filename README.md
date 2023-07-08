## About

Some HP printers include the webscan protocol. This client can be used to interact with this protocol and request scans from a printer on your local network.

This project is still in very early stages of development and only includes functionality to save the scan to a file.

Only tested with **HP Envy 6432e**.

## Installation

```bash
npm install hp-webscan-client
```

## Usage

```js
import {WebScan} from "hp-webscan-client"

// Create a new WebScan instance
const client = new WebScan({
    ip: "PRINTER_IP"
});

// Start scanning process and save file to output.pdf
client.scanToFile({
    color: true,
    output: {
        format: "application/pdf",
        path: "output.pdf"
    }
});

// Start scanning process and return document as buffer
const buffer = client.scanToBuffer({
    color: true,
    format: "application/pdf"
});
```