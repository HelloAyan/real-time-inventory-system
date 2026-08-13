import { createServer } from "http";
import { app } from "./app.js";
import { env } from "./config/env.js";

const httpServer = createServer(app);

httpServer.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
