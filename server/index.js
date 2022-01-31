const HTMLProxyServer = require('@pdftron/webviewer-html-proxy-server');

const OPTIONS = {
  SERVER_ROOT: `http://localhost`,
  PORT: 3100,
  // CORS_OPTIONS: { origin: "http://localhost:3000", credentials: true },
  // COOKIE_SETTING: { sameSite: 'none', secure: true },
};

HTMLProxyServer.createServer(OPTIONS);
