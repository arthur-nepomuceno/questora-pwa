import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Log dos cabeçalhos
  console.log("[PSP Webhook] Headers:", Object.fromEntries(request.headers.entries()));

  // Tentar logar o corpo em JSON
  try {
    const body = await request.json();
    console.log("[PSP Webhook] Body (JSON):", JSON.stringify(body, null, 2));
  } catch (error) {
    // Se falhar, tentar como texto puro
    try {
      const text = await request.text();
      console.log("[PSP Webhook] Body (text):", text);
    } catch (textError) {
      console.log("[PSP Webhook] Body (error):", textError);
    }
  }

  return NextResponse.json({ message: "OK" }, { status: 200 });
}

