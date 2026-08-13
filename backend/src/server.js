import { createServer } from "http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { startReservationSweep } from "./jobs/reservationSweep.job.js";

const httpServer = createServer(app);

startReservationSweep();

httpServer.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
