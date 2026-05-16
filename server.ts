import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Matchmaking queue
  let waitingUsers: string[] = [];

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-queue", () => {
      console.log("User joined queue:", socket.id);
      
      // Remove from any existing queue/room etc
      waitingUsers = waitingUsers.filter(id => id !== socket.id);

      if (waitingUsers.length > 0) {
        // Match found!
        const partnerId = waitingUsers.shift()!;
        const roomId = `room-${socket.id}-${partnerId}`;

        // Join room
        socket.join(roomId);
        io.to(partnerId).socketsJoin(roomId);

        // Notify both parties
        // We designate one as the 'initiator' (caller) and one as the 'receiver' (callee)
        io.to(partnerId).emit("match-found", { roomId, partnerId: socket.id, initiator: true });
        socket.emit("match-found", { roomId, partnerId, initiator: false });

        console.log(`Matched ${socket.id} with ${partnerId} in room ${roomId}`);
      } else {
        waitingUsers.push(socket.id);
        socket.emit("waiting");
      }
    });

    socket.on("leave-queue", () => {
      waitingUsers = waitingUsers.filter(id => id !== socket.id);
    });

    socket.on("signal", ({ roomId, signal }) => {
      // Proxy signal to the other person in the room
      socket.to(roomId).emit("signal", { signal });
    });

    socket.on("send-message", ({ roomId, message }) => {
      socket.to(roomId).emit("message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      waitingUsers = waitingUsers.filter(id => id !== socket.id);
      // Notify rooms
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room.startsWith("room-")) {
          socket.to(room).emit("partner-disconnected");
        }
      });
    });

    socket.on("skip", ({ roomId }) => {
      socket.to(roomId).emit("partner-skipped");
      socket.leave(roomId);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
