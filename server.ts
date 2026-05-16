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

  // Matchmaking queues
  let waitingVideoUsers: string[] = [];
  let waitingTextUsers: string[] = [];

  const broadcastOnlineCount = () => {
    io.emit("online-count", io.engine.clientsCount);
  };

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    broadcastOnlineCount();

    socket.on("join-queue", ({ mode } = { mode: 'video' }) => {
      console.log(`User ${socket.id} joined ${mode} queue`);
      
      // Clear from both queues first
      waitingVideoUsers = waitingVideoUsers.filter(id => id !== socket.id);
      waitingTextUsers = waitingTextUsers.filter(id => id !== socket.id);

      const queue = mode === 'text' ? waitingTextUsers : waitingVideoUsers;

      if (queue.length > 0) {
        // Match found!
        const partnerId = queue.shift()!;
        const roomId = `room-${socket.id}-${partnerId}`;

        // Join room
        socket.join(roomId);
        const partnerSocket = io.sockets.sockets.get(partnerId);
        if (partnerSocket) {
          partnerSocket.join(roomId);

          // Notify both parties
          io.to(partnerId).emit("match-found", { roomId, partnerId: socket.id, initiator: true, mode });
          socket.emit("match-found", { roomId, partnerId, initiator: false, mode });

          console.log(`Matched ${socket.id} with ${partnerId} in ${mode} room ${roomId}`);
        } else {
          // Partner left while waiting
          queue.push(socket.id);
          socket.emit("waiting");
        }
      } else {
        if (mode === 'text') waitingTextUsers.push(socket.id);
        else waitingVideoUsers.push(socket.id);
        socket.emit("waiting");
      }
    });

    socket.on("leave-queue", () => {
      waitingVideoUsers = waitingVideoUsers.filter(id => id !== socket.id);
      waitingTextUsers = waitingTextUsers.filter(id => id !== socket.id);
    });

    socket.on("signal", ({ roomId, signal }) => {
      // Proxy signal to the other person in the room
      socket.to(roomId).emit("signal", { signal });
    });

    socket.on("send-message", ({ roomId, message }) => {
      socket.to(roomId).emit("message", message);
    });

    socket.on("disconnecting", () => {
      console.log("User disconnecting:", socket.id);
      waitingVideoUsers = waitingVideoUsers.filter(id => id !== socket.id);
      waitingTextUsers = waitingTextUsers.filter(id => id !== socket.id);
      
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room.startsWith("room-")) {
          console.log(`Notifying partner in room ${room} that ${socket.id} is leaving`);
          socket.to(room).emit("partner-disconnected");
        }
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      broadcastOnlineCount();
    });

    socket.on("skip", ({ roomId }) => {
      console.log(`User ${socket.id} skipped room ${roomId}`);
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
