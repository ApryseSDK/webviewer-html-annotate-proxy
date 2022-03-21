# webviewer-html-annotate-proxy
Annotate live HTML pages by simply providing URL. This way you can preserve all the animations and any interactive content. [Watch the video](https://youtu.be/pamn97LMD6s) to see a demo and walkthrough of the project.

The sample uses [WebViewer HTML by PDFTron](https://www.npmjs.com/package/@pdftron/webviewer-html) for annotating HTML and [Proxy Server by PDFTron](https://www.npmjs.com/package/@pdftron/webviewer-html-proxy-server) for proxying the website from URL. 

## Install

#### Client
```
cd client
npm i
```

#### Server
```
cd server
npm i
```


## Run

#### Client
```
cd client
npm start
```

#### Server
```
cd server
npm start
```

## How it works

1. Client app makes the request to the Node.js Express server.
2. Node.js Express server serves the endpoint `/pdftron-proxy?url=someurl.com`, 
3. From the `url` query parameter, we start requesting all the website dependencies (HTML, CSS, JS, images).
4. The server responds back with proxied resources.
5. WebViewer then renders out live HTML that can be annotated.
