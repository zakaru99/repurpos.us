const PROXY_CONFIG = {
  "/api": {
    // target: "https://reframedb.org",
    target: "http://localhost:8000",
    changeOrigin: true,
    secure: false,
    logLevel: "debug",
    pathRewrite: { "^/api": "" }  // strips /api prefix for local backend
  }
};

module.exports = PROXY_CONFIG;
