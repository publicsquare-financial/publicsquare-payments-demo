import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { amount, cardId } = await req.json();
  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_PUBLICSQUARE_API_URI!}/payment-intents`, {
      method: 'POST',
      body: JSON.stringify({
        amount: amount,
        currency: 'USD',
        capture_method: 'Automatic',
        payment_method: { card: cardId },
        customer: {
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@example.com',
        },
        billing_details: {
          address_line_1: '111 Colorado Ave',
          city: 'Des Moines',
          state: 'IA',
          postal_code: '51111',
          country: 'US',
        },
      }),
      headers: {
        'x-api-key': process.env.PUBLICSQUARE_API_SECRET!,
        'Content-Type': 'application/json',
      },
    });
    const res = await result.json();

    if (!result.ok) {
      console.log(result.status);
      console.log(res);
    }

    return NextResponse.json(res);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: {
          message: 'Something went wrong',
        },
      },
      { status: 400 },
    );
  }
}
