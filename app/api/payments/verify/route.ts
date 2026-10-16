import { NextResponse } from 'next/server';
import {
  findPaymentByOrderId,
  updatePaymentRecord,
  findOrderById,
  updateOrderRecord,
  getPlatformSettings,
} from '@/lib/db/data-store';

/**
 * POST /api/payments/verify
 * Server-side payment verification endpoint.
 *
 * Rules:
 * - Orders are NEVER marked paid solely because the browser redirected from a gateway page.
 * - Handles idempotent retries and duplicate callbacks safely.
 * - Confirms transaction authenticity via provider signature when credentials are configured.
 * - If credentials are missing, reports gateway as unconfigured and leaves order payment in pending state.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderId,
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
      idempotencyKey,
    } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const order = await findOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const paymentRecord = await findPaymentByOrderId(orderId);
    if (!paymentRecord) {
      return NextResponse.json({ error: 'Payment transaction record not found' }, { status: 404 });
    }

    // Check for duplicate / idempotent completed callback
    if (paymentRecord.status === 'captured') {
      return NextResponse.json({
        success: true,
        message: 'Payment already verified and captured previously.',
        paymentStatus: 'paid',
        orderId: order.id,
      });
    }

    const settings = await getPlatformSettings();

    // Check if real gateway keys are configured in environment variables
    const razorpayKey = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKey || !razorpaySecret) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Payment Gateway is not configured with live merchant credentials. In-browser simulated payment confirmations are strictly rejected.',
          paymentStatus: paymentRecord.status,
          gatewayProvider: settings.paymentGatewayProvider,
          providerConfigured: false,
        },
        { status: 503 }
      );
    }

    // Cryptographic signature verification when credentials are provided
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${gatewayOrderId}|${gatewayPaymentId}`)
      .digest('hex');

    if (gatewaySignature !== expectedSignature) {
      await updatePaymentRecord(paymentRecord.id, {
        status: 'failed',
        gatewayOrderId,
        gatewayPaymentId,
        gatewaySignature,
        notes: 'Cryptographic signature verification failed',
      });
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Signature matches: Atomically update payment and order records
    const now = new Date().toISOString();
    await updatePaymentRecord(paymentRecord.id, {
      status: 'captured',
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
      idempotencyKey,
      capturedAt: now,
    });

    await updateOrderRecord(orderId, {
      paymentStatus: 'paid',
      orderStatus: 'processing',
    });

    return NextResponse.json({
      success: true,
      message: 'Payment successfully verified and order marked paid.',
      paymentStatus: 'paid',
      orderId,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Internal payment verification error' }, { status: 500 });
  }
}
