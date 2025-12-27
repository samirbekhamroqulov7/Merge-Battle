import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { file: string } }
) {
  return new NextResponse(null, {
    status: 404,
  })
}
