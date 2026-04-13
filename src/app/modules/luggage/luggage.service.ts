import mongoose from 'mongoose';
import LuggageModel from './luggage.model';
import RackModel from '../rack/rack.model';
import OrderModel from '../order/order.model';

class LuggageService {
  /**
   * Intelligent Warehouse Rack Allocation
   * Suggests a rack based on Flight Departure Time prioritization.
   * Early flights (shortest Δt) -> Closest racks (lowest distance_to_dock)
   * Later flights -> Deeper racks (higher distance_to_dock)
   */
  async allocateSmartRack(luggageId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Fetch the luggage and its flight details
      const luggage = await LuggageModel.findById(luggageId).session(session);
      if (!luggage) {
        throw new Error('Luggage not found');
      }

      const order = await OrderModel.findById(luggage.order_id).session(session);
      if (!order) {
        throw new Error('Associated order/flight details not found');
      }

      // 2. Calculate time difference between flight_time and current time
      const now = new Date();
      const flightTime = new Date(order.flight_time);
      const diffInHours = (flightTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // 3. Query the Racks collection for empty documents
      const emptyRacks = await RackModel.find({ is_occupied: false }).session(session);
      if (!emptyRacks || emptyRacks.length === 0) {
        throw new Error('No empty racks available in the warehouse');
      }

      // 4. Intelligent Prioritization Logic
      // Threshold: 6 hours. Early flights get closest racks. Later flights get deeper racks.
      let suggestedRack;
      if (diffInHours < 6) {
        // Bags for Early Flights (shortest Δt) -> closest to the exit door (ASC)
        emptyRacks.sort((a, b) => a.distance_to_dock - b.distance_to_dock);
        suggestedRack = emptyRacks[0]; 
      } else {
        // Bags for Later Flights -> stored deeper in the warehouse (DESC)
        emptyRacks.sort((a, b) => b.distance_to_dock - a.distance_to_dock);
        suggestedRack = emptyRacks[0];
      }

      // 5. Update Rack: Toggle is_occupied and link luggage_id
      await RackModel.findByIdAndUpdate(
        suggestedRack._id,
        {
          is_occupied: true,
          luggage_id: luggageId,
        },
        { session }
      );

      // 6. Update Luggage: Link rack_id and update status
      await LuggageModel.findByIdAndUpdate(
        luggageId,
        {
          rack_id: suggestedRack._id,
          current_status: 'in_warehouse',
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return {
        status: true,
        message: 'Luggage smarter rack allocation completed',
        data: {
          luggageId,
          rack_code: suggestedRack.rack_code,
          distance_to_dock: suggestedRack.distance_to_dock,
          time_to_flight_hours: diffInHours.toFixed(2),
          priority: diffInHours < 6 ? 'High (Early Flight)' : 'Normal (Late Flight)'
        },
      };
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      return {
        status: false,
        message: error.message || 'Failed to allocate rack intelligently',
      };
    }
  }

  /**
   * Real-time Luggage Tracking
   * Fetches the luggage's current status and the real-time location of the 
   * assigned driver if the batch is in transit.
   */
  async trackLuggageLocation(luggageId: string) {
    try {
      const luggage = await LuggageModel.findById(luggageId).populate({
        path: 'batch_id',
        populate: {
          path: 'driver_id',
          select: 'fullname phoneNumber latitude longitude'
        }
      });

      if (!luggage) {
        throw new Error('Luggage not found');
      }

      const batch = luggage.batch_id as any;
      
      // If no batch is assigned yet, the luggage is likely in the warehouse or just created
      if (!batch) {
        return {
          status: true,
          message: 'Luggage is currently processing or stored in warehouse',
          data: {
            luggage_status: luggage.current_status,
            is_moving: false
          }
        };
      }

      const driver = batch.driver_id;
      
      return {
        status: true,
        message: 'Tracking information synchronized successfully',
        data: {
          luggage_status: luggage.current_status,
          batch_status: batch.status,
          is_moving: batch.status === 'transit',
          last_known_driver_location: driver ? {
            lat: driver.latitude,
            lng: driver.longitude,
            last_updated: (driver as any).updatedAt
          } : null,
          driver_contact: driver ? {
            name: driver.fullname,
            phone: driver.phoneNumber
          } : null
        }
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to retrieve tracking data'
      };
    }
  }
}

export default new LuggageService();
