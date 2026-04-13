import Stripe from "stripe";
import config from "../../config";
import { PaymentResponse, WebhookEvent } from "./payment.interface";
import { PAYMENT_STATUS, WEBHOOK_EVENTS } from "./payment.constant";
import OrderService from "../order/order.service";
import {
  CartPaymentRequest,
  CartPaymentResponse,
  CartPaymentMetadata,
} from "./cart-payment.interface";
import { compressMetadata, decompressMetadata } from "./metadata.utils";

const stripe = new Stripe(
  config.stripe_payment_gateway.stripe_secret_key || "",
  {
    apiVersion: "2025-08-27.basil" as any,
  }
);

class PaymentService {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  // Simplified as Cart module is removed
  async createCartCheckoutSession(
    paymentRequest: CartPaymentRequest,
    userId: string,
    paymentMethodType: string = 'card'
  ): Promise<CartPaymentResponse> {
    return {
      status: false,
      message: "Cart-based checkout is deprecated. Use luggage booking directly.",
    };
  }

  async getAvailablePaymentMethods(): Promise<PaymentResponse> {
    return {
      status: true,
      message: "Available payment methods retrieved successfully",
      data: {
        paymentMethods: [
          { id: 'card', name: 'Credit/Debit Card', enabled: true, description: 'Pay with card', icon: 'card' },
          { id: 'stripe', name: 'Stripe', enabled: true, description: 'Pay with Stripe', icon: 'stripe' }
        ],
        defaultMethod: 'card',
      },
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResponse> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status === "succeeded") {
        return {
          status: true,
          message: "Payment confirmed successfully",
          data: { paymentIntentId: paymentIntent.id },
        };
      }
      return { status: false, message: `Payment status: ${paymentIntent.status}` };
    } catch (error: any) {
      return { status: false, message: error.message };
    }
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<PaymentResponse> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        ...(amount && { amount: amount * 100 }),
      });
      return {
        status: true,
        message: "Refund processed successfully",
        data: { refundId: refund.id },
      };
    } catch (error: any) {
      return { status: false, message: error.message };
    }
  }

  async processWebhookEvent(event: WebhookEvent): Promise<PaymentResponse> {
    try {
      const paymentIntent = event.data.object as any;
      const orderId = paymentIntent.metadata?.orderId;

      if (event.type === WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED && orderId) {
        await this.orderService.updatePaymentStatus(orderId, PAYMENT_STATUS.PAID);
        return { status: true, message: "Payment succeeded and order updated" };
      }

      return { status: true, message: `Handled event ${event.type}` };
    } catch (error: any) {
      return { status: false, message: error.message };
    }
  }

  async createDirectPayment(paymentRequest: any, userId: string): Promise<PaymentResponse> {
    try {
      // Mocked for compatibility with old controller
      return {
        status: false,
        message: "Direct payment through this endpoint is deprecated.",
      };
    } catch (error: any) {
      return { status: false, message: error.message };
    }
  }

  async constructWebhookEvent(payload: string | Buffer, signature: string | undefined): Promise<WebhookEvent> {
    return stripe.webhooks.constructEvent(
      payload,
      signature || "",
      config.stripe_payment_gateway.stripe_webhook_secret || ""
    ) as unknown as WebhookEvent;
  }
}

export default PaymentService;
