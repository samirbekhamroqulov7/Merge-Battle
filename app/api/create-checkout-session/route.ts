import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 })
    }

    const { purchaseId, itemName, price, itemType, itemId } = await request.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: itemName,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/success?session_id={CHECKOUT_SESSION_ID}&purchase_id=${purchaseId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/profile?payment_cancelled=true`,
      metadata: {
        purchaseId,
        itemType,
        itemId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Stripe error occurred" }, { status: 500 })
  }
}
