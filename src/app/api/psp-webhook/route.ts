import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Log dos cabeçalhos
  console.log("[PSP Webhook] Headers:", Object.fromEntries(request.headers.entries()));

  // Log do corpo (application/x-www-form-urlencoded)
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  console.log("[PSP Webhook] Body:", body);

  return NextResponse.json({ message: "OK" }, { status: 200 });
}

