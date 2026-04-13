import { Server, Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import LuggageModel from '../modules/luggage/luggage.model';
import BatchModel from '../modules/batch/batch.model';

/**
 * Socket.io Service for Real-time Dual Scanning Synchronization
 * Synchronizes progress between Driver and Helper for luggage loading/unloading.
 */
export const socketService = (io: Server) => {
  // Middleware: Verify JWT token before allowing connection
  io.use((socket: Socket, next) => {
    // Check for token in auth object or headers
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(
        token, 
        config.jwt_access_secret as string
      ) as JwtPayload;
      
      // Store user info in socket data
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket Connected: ${socket.id} (User: ${socket.data.user?.id})`);

    // Event: join_batch - User joins a room specific to a batch
    socket.on('join_batch', ({ batch_id, userId }) => {
      const roomName = `batch_${batch_id}`;
      socket.join(roomName);
      console.log(`👤 User ${userId} joined Batch Room: ${roomName}`);
      
      // Notify the room that a team member joined (optional but helpful)
      socket.to(roomName).emit('member_joined', { userId });
    });

    // Event: bag_scanned - Triggered when Helper/Driver scans a bag
    socket.on('bag_scanned', async ({ barcode_id, batch_id }) => {
      try {
        const roomName = `batch_${batch_id}`;

        // 1. Update the luggage status in MongoDB
        // We use 'scanned_inbound' to represent the physical scan has occurred
        const luggage = await LuggageModel.findOneAndUpdate(
          { barcode_id, batch_id },
          { current_status: 'scanned_inbound' },
          { new: true }
        );

        if (!luggage) {
          socket.emit('error', { message: `Luggage with barcode ${barcode_id} not found in this batch` });
          return;
        }

        // 2. Recalculate the total scanned_count for that batch
        const scannedCount = await LuggageModel.countDocuments({
          batch_id,
          current_status: 'scanned_inbound'
        });

        // 3. Fetch batch to get total bags assigned (current_count)
        const batch = await BatchModel.findById(batch_id);
        if (!batch) {
          socket.emit('error', { message: 'Batch recording not found' });
          return;
        }

        // 4. broadcast count_updated to everyone in the room (Driver/Helper)
        io.to(roomName).emit('count_updated', {
          batch_id,
          scanned_count: scannedCount,
          total_bags: batch.current_count,
          last_scanned_barcode: barcode_id
        });

        console.log(`📦 Batch ${batch_id}: ${scannedCount}/${batch.current_count} bags scanned`);

        // 5. Completion Logic
        // If scanned_count reaches the batch's total assigned bags, complete the sequence
        if (scannedCount >= (batch.current_count || 0)) {
          io.to(roomName).emit('batch_completed', {
            batch_id,
            total_bags: batch.current_count,
            message: 'All luggage in this batch have been successfully scanned and synchronized.'
          });
          
          // Automatically move batch status to transit or completed if appropriate
          await BatchModel.findByIdAndUpdate(batch_id, { status: 'loading' });
        }

      } catch (error: any) {
        console.error('❌ Socket Error [bag_scanned]:', error.message);
        socket.emit('error', { message: 'Internal server error during synchronization' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket Disconnected: ${socket.id}`);
    });
  });
};
