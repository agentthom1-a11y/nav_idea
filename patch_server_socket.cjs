const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import { createServer as createViteServer } from "vite";',
  'import { createServer as createViteServer } from "vite";\nimport http from "http";\nimport { Server as SocketIOServer } from "socket.io";'
);

content = content.replace(
  '  const app = express();\n  const PORT = 3000;',
  `  const app = express();
  const PORT = 3000;
  const httpServer = http.createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' }
  });

  const activeUsers = new Map();

  io.on("connection", (socket) => {
    let currentRoom = null;
    let currentUser = null;

    socket.on("join-document", ({ documentId, user }) => {
      if (currentRoom) {
        socket.leave(currentRoom);
        const prevRoomUsers = activeUsers.get(currentRoom);
        if (prevRoomUsers) {
          prevRoomUsers.delete(socket.id);
          io.to(currentRoom).emit("presence-update", Array.from(prevRoomUsers.values()));
        }
      }

      currentRoom = \`doc_\${documentId}\`;
      currentUser = user;
      socket.join(currentRoom);

      if (!activeUsers.has(currentRoom)) {
        activeUsers.set(currentRoom, new Map());
      }
      const roomUsers = activeUsers.get(currentRoom);
      roomUsers.set(socket.id, user);

      io.to(currentRoom).emit("presence-update", Array.from(roomUsers.values()));
    });

    socket.on("disconnect", () => {
      if (currentRoom && activeUsers.has(currentRoom)) {
        const roomUsers = activeUsers.get(currentRoom);
        roomUsers.delete(socket.id);
        io.to(currentRoom).emit("presence-update", Array.from(roomUsers.values()));
        if (roomUsers.size === 0) {
          activeUsers.delete(currentRoom);
        }
      }
    });
  });`
);

content = content.replace(
  '  app.listen(PORT, "0.0.0.0", () => {',
  '  httpServer.listen(PORT, "0.0.0.0", () => {'
);

fs.writeFileSync(file, content);
console.log('Server patched for socket.io');
