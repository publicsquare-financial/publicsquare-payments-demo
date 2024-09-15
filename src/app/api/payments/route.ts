import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Parse json body
  const {
    amount,
    payment_method,
    customer,
    billing_details,
    shipping_address,
  } = await req.json()
  try {
    const result = await fetch(`${process.env.PUBLICSQUARE_API_URI}/payments`, {
      method: 'POST',
      body: JSON.stringify({
        amount,
        currency: 'USD',
        capture: true,
        payment_method,
        customer,
        billing_details,
        shipping_address,
      }),
      headers: {
        'x-api-key': process.env.PUBLICSQUARE_API_SECRET!,
        'Content-Type': 'application/json',
      },
    })
    console.log(result.status)
    return NextResponse.json(await result.json())
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      {
        error: {
          message: 'Something went wrong',
        },
      },
      { status: 400 }
    )
  }
}
