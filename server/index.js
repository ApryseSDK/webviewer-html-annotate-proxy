const HTMLProxyServer = require('@pdftron/webviewer-html-proxy-server');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 3000;
const NODE_PORT = process.env.REACT_APP_NODE_PORT || 3100;
const REACT_HOST = process.env.REACT_APP_HOST || 'localhost';

const OPTIONS = {
  SERVER_ROOT: `http://${REACT_HOST}`,
  PORT: NODE_PORT,
  CORS_OPTIONS: { origin: `http://${REACT_HOST}:${PORT}`, credentials: true },
  ALLOW_HTTP_PROXY: true,
};

HTMLProxyServer.createServer(OPTIONS);
