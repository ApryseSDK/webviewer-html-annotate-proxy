const HTMLProxyServer = require('@pdftron/webviewer-html-proxy-server');

HTMLProxyServer.createServer(`http://localhost`, 3100, { origin: `http://localhost:3000`, credentials: true });
