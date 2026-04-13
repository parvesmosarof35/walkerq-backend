import { z } from "zod";

const createOrderSchema = z.object({
  body: z.object({
    user_id: z.string({ message: "User ID is required" }),
    flight_number: z.string({ message: "Flight number is required" }),
    flight_time: z.string({ message: "Flight time is required" }).transform(val => new Date(val)),
    total_bags: z.number({ message: "Total bags is required" }).min(1),
    payment_status: z.enum(['pending', 'paid', 'manual']).default('pending'),
    payment_method: z.enum(['stripe', 'paypal', 'cash', 'pos']).optional(),
  }),
});

const getOrderListSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional().default(1 as any),
    limit: z.string().transform(Number).optional().default(10 as any),
    payment_status: z.enum(['pending', 'paid', 'manual']).optional(),
  }),
});

const OrderValidationSchemas = {
  createOrderSchema,
  getOrderListSchema,
};

export default OrderValidationSchemas;
