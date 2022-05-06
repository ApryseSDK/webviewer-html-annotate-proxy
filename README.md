# webviewer-html-annotate-proxy
Annotate live HTML pages by simply providing URL. This way you can preserve all the animations and any interactive content. [Watch the video](https://youtu.be/pamn97LMD6s) to see a demo and walkthrough of the project.

The sample uses [WebViewer HTML by PDFTron](https://www.npmjs.com/package/@pdftron/webviewer-html) for annotating HTML and [Proxy Server by PDFTron](https://www.npmjs.com/package/@pdftron/webviewer-html-proxy-server) for proxying the website from URL. 

## Install

We have prepared a single script for installing both client and server.

```
npm run setup
```

## Run

We have prepared a single script for running both client and server.

```
npm run start
```

Alternatively, you can also install and run client and server separately.

## How it works

1. Client app makes the request to the Node.js Express server.
2. Node.js Express server serves the endpoint `/pdftron-proxy?url=someurl.com`, 
3. From the `url` query parameter, we start requesting all the website dependencies (HTML, CSS, JS, images).
4. The server responds back with proxied resources.
5. WebViewer then renders out live HTML that can be annotated.
