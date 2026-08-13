import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { startReservationSweep } from "./jobs/reservationSweep.job.js";
import { registerDropSocketHandlers } from "./sockets/dropSocket.js";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: env.clientUrl },
});

registerDropSocketHandlers(io);
startReservationSweep();

httpServer.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
