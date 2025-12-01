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
      credentials: true,
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  // Make socket server globally accessible for server actions (singleton pattern)
  global.io = io;
  
  // Store socket instance for getIO() function
  if (typeof global.setSocketIO === 'function') {
    global.setSocketIO(io);
  }

  // Enhanced Socket.io logic with database integration
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Log connection metrics
    const socketCount = io.sockets.sockets.size;
    console.log(`Total connected sockets: ${socketCount}`);

    // Join conversation room
    socket.on('join-conversation', (conversationId) => {
      if (!conversationId) {
        console.warn('join-conversation: conversationId is missing');
        return;
      }
      socket.join(`conversation-${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
      
      // Log room info for debugging
      const room = io.sockets.adapter.rooms.get(`conversation-${conversationId}`);
      const socketCount = room ? room.size : 0;
      console.log(`Room conversation-${conversationId} now has ${socketCount} clients`);
    });

    // Leave conversation room
    socket.on('leave-conversation', (conversationId) => {
      if (!conversationId) return;
      socket.leave(`conversation-${conversationId}`);
      console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });
    
    // Handle broadcast request from server actions
    socket.on('broadcast-message', (data) => {
      if (!data || !data.conversationId || !data.message) {
        console.warn('broadcast-message: Invalid data', data);
        return;
      }
      const roomName = `conversation-${data.conversationId}`;
      console.log('Broadcasting message to room:', roomName);
      io.to(roomName).emit('new-message', data.message);
      
      // Log room info for debugging
      const room = io.sockets.adapter.rooms.get(roomName);
      const socketCount = room ? room.size : 0;
      console.log(`Room ${roomName} has ${socketCount} clients, message broadcasted`);
    });

    // Handle message sending (from admin) - with database integration
    socket.on('send-message', async (data) => {
      try {
        if (!data || !data.conversationId || !data.content || !data.userId) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        // Import database functions
        const { db } = await import('./src/lib/db/index.js');
        const { messages } = await import('./src/lib/db/schema.js');
        const { eq } = await import('drizzle-orm');

        // Save message to database
        const [newMessage] = await db.insert(messages).values({
          conversation_id: data.conversationId,
          user_id: data.userId,
          content: data.content
        }).returning();

        // Broadcast to all users in the conversation
        io.to(`conversation-${data.conversationId}`).emit('new-message', {
          id: newMessage.id,
          content: newMessage.content,
          user_id: newMessage.user_id,
          user_name: data.userName || 'User',
          created_at: newMessage.created_at,
          conversation_id: data.conversationId
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message sending from portal (via HTTP, this is just for acknowledgment)
    socket.on('send-message-portal', async (data) => {
      console.log('Server.js: Received send-message-portal acknowledgment:', data);
      // Portal messages are sent via HTTP, this is just for real-time acknowledgment
      if (data && data.conversationId && data.message) {
        io.to(`conversation-${data.conversationId}`).emit('new-message', data.message);
      }
    });

    // Handle message acknowledgment (for delivery status)
    socket.on('message-ack', async (data) => {
      try {
        if (!data || !data.messageId || !data.userId) {
          return;
        }

        // Import database functions
        const { db } = await import('./src/lib/db/index.js');
        const { messages } = await import('./src/lib/db/schema.js');
        const { eq } = await import('drizzle-orm');

        // Update message delivery status to 'delivered'
        await db.update(messages)
          .set({ delivery_status: 'delivered' })
          .where(eq(messages.id, data.messageId));

        // Broadcast delivery status update
        if (data.conversationId) {
          io.to(`conversation-${data.conversationId}`).emit('message-delivered', {
            messageId: data.messageId,
            userId: data.userId,
            deliveredAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error processing message ack:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      if (!data || !data.conversationId) return;
      socket.to(`conversation-${data.conversationId}`).emit('user-typing', {
        userId: data.userId,
        userName: data.userName,
        isTyping: data.isTyping !== false
      });
    });

    // Handle message reactions (real-time)
    socket.on('message-reaction', async (data) => {
      try {
        if (!data || !data.messageId || !data.conversationId || !data.emoji || !data.userId) {
          return;
        }

        const { addReaction, removeReaction } = await import('./src/actions/chat-reactions.js');
        
        if (data.action === 'add') {
          await addReaction(data.messageId, data.emoji);
        } else if (data.action === 'remove') {
          await removeReaction(data.messageId, data.emoji);
        }

        // Broadcast to all users in the conversation
        io.to(`conversation-${data.conversationId}`).emit('message-reaction', {
          messageId: data.messageId,
          emoji: data.emoji,
          userId: data.userId,
          action: data.action,
        });
      } catch (error) {
        console.error('Error handling reaction:', error);
        socket.emit('error', { message: 'Failed to process reaction' });
      }
    });

    // Handle user presence (online/offline)
    socket.on('user-online', (data) => {
      if (data && data.conversationId && data.userId) {
        socket.to(`conversation-${data.conversationId}`).emit('user-online', {
          userId: data.userId,
          status: 'online'
        });
      }
    });

    // Handle mention notifications
    socket.on('mention-notification', (data) => {
      if (data && data.mentionedUserId) {
        socket.to(`user-${data.mentionedUserId}`).emit('mention-notification', {
          conversationId: data.conversationId,
          messageId: data.messageId,
        });
      }
    });

    // Handle read receipt
    socket.on('read-receipt', async (data) => {
      try {
        if (!data || !data.messageId || !data.userId || !data.conversationId) {
          return;
        }

        // Import database functions
        const { db } = await import('./src/lib/db/index.js');
        const { message_reads, messages } = await import('./src/lib/db/schema.js');
        const { eq, and } = await import('drizzle-orm');

        // Mark message as read
        await db.insert(message_reads).values({
          message_id: data.messageId,
          user_id: data.userId
        }).onConflictDoNothing();

        // Update message delivery status to 'read' if all participants have read
        // (This is a simplified version, you may want to check all participants)
        await db.update(messages)
          .set({ delivery_status: 'read' })
          .where(eq(messages.id, data.messageId));

        // Broadcast read receipt
        io.to(`conversation-${data.conversationId}`).emit('message-read', {
          messageId: data.messageId,
          userId: data.userId,
          readAt: new Date()
        });
      } catch (error) {
        console.error('Error processing read receipt:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log('User disconnected:', socket.id, 'Reason:', reason);
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
