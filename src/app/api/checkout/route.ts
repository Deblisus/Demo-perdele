import { NextRequest } from 'next/server';
import { checkoutSchema } from '@/lib/validation';
import { processCheckout } from '@/services/checkout.service';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = checkoutSchema.parse(body);
    
    // Process checkout
    const result = await processCheckout(validatedData);
    
    return Response.json(
      {
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        paymentUrl: result.paymentUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed:', JSON.stringify(error.flatten().fieldErrors, null, 2));
      return Response.json(
        { message: 'Validation failed', errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    console.error('Checkout error:', error);
    return Response.json(
      { message: 'An unexpected error occurred during checkout' },
      { status: 500 }
    );
  }
}
