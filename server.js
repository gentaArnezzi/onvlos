const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      credentials: true
    }
  });

  // Enhanced Socket.io logic with database integration
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join conversation room
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation-${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation-${conversationId}`);
      console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Handle message sending (from admin) - simplified version
    // Full database integration is handled in src/lib/socket.ts
    // This is a fallback for basic message broadcasting
    socket.on('send-message', (data) => {
      // Broadcast to all users in the conversation
      io.to(`conversation-${data.conversationId}`).emit('new-message', {
        id: data.id || `temp-${Date.now()}`,
        content: data.content,
        user_id: data.userId,
        user_name: data.userName,
        created_at: data.created_at || new Date(),
        conversation_id: data.conversationId
      });
    });

    // Handle message sending from portal
    socket.on('send-message-portal', (data) => {
      // Broadcast to all users in the conversation
      // Database saving is handled by the action
      io.to(`conversation-${data.conversationId}`).emit('new-message', {
        id: data.id || `temp-${Date.now()}`,
        content: data.content,
        user_id: data.userId,
        user_name: data.userName,
        created_at: data.created_at || new Date(),
        conversation_id: data.conversationId
      });
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.to(`conversation-${data.conversationId}`).emit('user-typing', {
        userId: data.userId,
        userName: data.userName,
        isTyping: data.isTyping !== false
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', { message: 'An error occurred' });
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io server initialized`);
  });
});
