import { NextRequest } from 'next/server';
import { findOrderById } from '@/services/order.service';
import { fanCourierClient } from '@/lib/integrations/fan-courier';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the order
    const order = await findOrderById(id);
    if (!order) {
      return Response.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Default tracking events
    let trackingEvents: any[] = [];

    // If order has an AWB number, fetch tracking events
    if (order.awbNumber) {
      try {
        trackingEvents = await fanCourierClient.trackAwb(order.awbNumber);
      } catch (error) {
        console.error(`Failed to fetch tracking for AWB ${order.awbNumber}:`, error);
        // We still return the order info, just with empty or error tracking
      }
    }

    return Response.json(
      {
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
          awbNumber: order.awbNumber,
        },
        tracking: trackingEvents,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Order tracking error:', error);
    return Response.json(
      { message: 'An unexpected error occurred while fetching tracking info' },
      { status: 500 }
    );
  }
}
