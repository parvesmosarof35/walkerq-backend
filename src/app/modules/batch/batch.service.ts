import mongoose from "mongoose";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import BatchModel from "./batch.model";
import OrderModel from "../order/order.model";
import LuggageModel from "../luggage/luggage.model";

const assignBagsToBatch = async (orderId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find the order
    const order = await OrderModel.findById(orderId).session(session);
    if (!order) {
      throw new AppError(httpStatus.NOT_FOUND, "Order not found", "");
    }

    const bagsToAssign = order.total_bags;

    // 2. Find the latest pending inbound batch
    let currentBatch = await BatchModel.findOne({
      type: "inbound",
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .session(session);

    // 3. Atomicity Rule Check
    let batchToUse;

    if (currentBatch && (currentBatch.current_count + bagsToAssign) <= currentBatch.max_capacity) {
      // Use existing batch
      batchToUse = currentBatch;
      batchToUse.current_count += bagsToAssign;
      await batchToUse.save({ session });
    } else {
      // If no batch exists or not enough space for ALL bags, create a new one
      // If currentBatch exists, it will remain "pending" but won't be used for this order
      // (or we could mark it as 'loading' or similar if it's considered "full" for this logic)
      
      const lastBatch = await BatchModel.findOne({ type: 'inbound' }).sort({ batch_number: -1 });
      const nextBatchNumber = (lastBatch?.batch_number || 0) + 1;

      batchToUse = new BatchModel({
        type: "inbound",
        batch_number: nextBatchNumber,
        status: "pending",
        current_count: bagsToAssign,
        max_capacity: 120,
      });
      await batchToUse.save({ session });
    }

    // 4. Assign Batch ID to all luggages associated with this order
    const luggages = await LuggageModel.find({ order_id: orderId }).session(session);
    
    if (luggages.length === 0) {
        // If luggages don't exist yet, we might need to create them here or throw error
        // Based on the prompt, it seems they should exist or be tracked.
        // Let's create them if they don't exist, using order_id and generating barcode placeholders
        for (let i = 0; i < bagsToAssign; i++) {
            await LuggageModel.create([{
                order_id: orderId,
                barcode_id: `BC-${orderId}-${i}-${Date.now()}`,
                current_status: 'scanned_inbound',
                batch_id: batchToUse._id
            }], { session });
        }
    } else {
        await LuggageModel.updateMany(
            { order_id: orderId },
            { 
                $set: { 
                    batch_id: batchToUse._id,
                    current_status: 'scanned_inbound'
                } 
            },
            { session }
        );
    }

    await session.commitTransaction();
    session.endSession();

    return {
        success: true,
        message: "Bags successfully assigned to batch",
        batch_id: batchToUse._id,
        batch_number: batchToUse.batch_number
    };

  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to assign bags to batch",
      error.message
    );
  }
};

const BatchServices = {
  assignBagsToBatch,
};

export default BatchServices;
