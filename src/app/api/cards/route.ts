import { NextResponse } from 'next/server';

export async function GET() {
  // Parse json body
  try {
    const result = await fetch(`${process.env.PUBLICSQUARE_API_URI}/payment-methods/cards`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.PUBLICSQUARE_API_SECRET!,
        'Content-Type': 'application/json',
      },
    });
    console.log(result.status);
    return NextResponse.json(await result.json());
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
