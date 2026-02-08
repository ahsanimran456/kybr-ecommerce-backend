const http = require("http");
const app = require("./app");
const { env } = require("./config/env");

const server = http.createServer(app);

server.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${env.port}`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
