import { NextRequest, NextResponse } from 'next/server'
import { updatePurchaseStatus } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')
    const purchaseId = searchParams.get('purchase_id')
    
    if (!sessionId) {
      return NextResponse.redirect(new URL('/profile?payment=error', request.url))
    }
    
    if (purchaseId) {
      await updatePurchaseStatus(purchaseId, 'completed')
    }
    
    return NextResponse.redirect(new URL('/profile?payment=success', request.url))
  } catch (error) {
    console.error('Payment success error:', error)
    return NextResponse.redirect(new URL('/profile?payment=error', request.url))
  }
}
