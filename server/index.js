const HTMLProxyServer = require('@pdftron/webviewer-html-proxy-server');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 3000;
const NODE_PORT = process.env.REACT_APP_NODE_PORT || 3100;

const OPTIONS = {
  SERVER_ROOT: `http://localhost`,
  PORT: NODE_PORT,
  CORS_OPTIONS: { origin: `http://localhost:${PORT}`, credentials: true },
  // COOKIE_SETTING: { sameSite: 'none', secure: true },
};

HTMLProxyServer.createServer(OPTIONS);
