import express from 'express';
import { InventoryController } from './inventory.controller';

const router = express.Router();

// Get the entire layout (Shelves with their racks)
router.get('/inventory', InventoryController.getAllInventory);

// Shelf Management
router.post('/shelves', InventoryController.createShelf);
router.delete('/shelves/:shelfId', InventoryController.deleteShelf);

// Rack Management
router.post('/shelves/:shelfId/racks', InventoryController.createRack);
router.delete('/shelves/:shelfId/racks/:rackId', InventoryController.deleteRack);

// Capacity & Luggage Operations
router.patch('/racks/:rackId', InventoryController.updateRack);

export const InventoryRoutes = router;
