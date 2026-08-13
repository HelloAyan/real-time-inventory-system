import { dropEvents } from "../events/dropEvents.js";

export const registerDropSocketHandlers = (io) => {
  dropEvents.on("stock:updated", (payload) => {
    io.emit("stock:updated", payload);
  });

  dropEvents.on("reservation:expired", (payload) => {
    io.emit("reservation:expired", payload);
  });

  dropEvents.on("purchase:new", (payload) => {
    io.emit("purchase:new", payload);
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};
