import { NextRequest, NextResponse } from 'next/server'

type PayoutBodySchema = {
  external_id: string
  amount: number
  payment_method: {
    card: string
    bank_account: string
  }
  customer: {
    id: string
    external_id: string
    business_name: string
    first_name: string
    last_name: string
    email: string
    phone: string
  }
  billing_details: {
    address_line_1: string
    address_line_2: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}

export async function POST(req: NextRequest) {
  // Parse json body
  const { amount, payment_method, customer, billing_details, ...rest } =
    (await req.json()) as Partial<PayoutBodySchema>

  if (
    !amount ||
    !payment_method?.card ||
    !payment_method?.bank_account ||
    !customer?.id ||
    !billing_details?.address_line_1 ||
    !billing_details?.city ||
    !billing_details?.state ||
    !billing_details?.postal_code ||
    !billing_details?.country
  ) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const result = await fetch(`${process.env.PUBLICSQUARE_API_URI}/payouts`, {
      method: 'POST',
      body: JSON.stringify({
        amount: amount * 100,
        currency: 'USD',
        payment_method,
        customer,
        billing_details,
        ...rest,
      }),
      headers: {
        'x-api-key': process.env.PUBLICSQUARE_API_SECRET!,
        'Content-Type': 'application/json',
      },
    })

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
