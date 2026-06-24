import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ paymentIntentId: string }> },
) {
  const { paymentIntentId } = await params;
  const body = await req.json();
  try {
    const result = await fetch(
      `${process.env.NEXT_PUBLIC_PUBLICSQUARE_API_URI!}/payment-intents/${paymentIntentId}/three_d_secure/complete`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'x-api-key': process.env.PUBLICSQUARE_API_SECRET!,
          'Content-Type': 'application/json',
        },
      },
    );
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
