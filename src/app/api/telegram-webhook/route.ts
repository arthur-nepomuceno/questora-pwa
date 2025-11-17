"use server";

import { NextRequest, NextResponse } from "next/server";

interface TelegramMessage {
  message?: {
    text?: string;
    chat?: {
      id: number;
      type?: string;
      username?: string;
      title?: string;
    };
  };
}

async function sendTelegramMessage({
  botToken,
  chatId,
  text,
}: {
  botToken: string;
  chatId: number;
  text: string;
}) {
  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      }
    );

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text();
      console.error(
        "[TelegramWebhook] Failed to send message",
        telegramResponse.status,
        errorText
      );
    }
  } catch (error) {
    console.error("[TelegramWebhook] Error sending message", error);
  }
}

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const pushinpayApiKey = process.env.PUSHINPAY_API_KEY;

  if (!configuredSecret) {
    console.error("[TelegramWebhook] Missing TELEGRAM_WEBHOOK_SECRET");
  }

  if (!botToken) {
    console.error("[TelegramWebhook] Missing TELEGRAM_BOT_TOKEN");
  }

  const receivedSecret =
    request.headers.get("x-telegram-secret") ??
    request.nextUrl.searchParams.get("secret") ??
    "";

  // if (configuredSecret && receivedSecret !== configuredSecret) {
  //   console.warn("[TelegramWebhook] Invalid webhook secret received");
  //   return NextResponse.json({ ok: true }, { status: 200 });
  // }

  let update: TelegramMessage | null = null;

  try {
    update = (await request.json()) as TelegramMessage;
  } catch (error) {
    console.error("[TelegramWebhook] Failed to parse request body", error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const messageText = update?.message?.text ?? "";
  const chatId = update?.message?.chat?.id;
  const trimmedMessage = messageText.trim();

  if (botToken && chatId && trimmedMessage.startsWith("/start")) {
    const welcomeMessage =
      "Olá! Seja bem-vindo ao bot do Show do Milênio. Em breve traremos novidades por aqui.";
    await sendTelegramMessage({ botToken, chatId, text: welcomeMessage });
  }

  if (botToken && chatId && trimmedMessage.startsWith("/comprar")) {
    if (!pushinpayApiKey) {
      console.error("[TelegramWebhook] Missing PUSHINPAY_API_KEY");
      await sendTelegramMessage({
        botToken,
        chatId,
        text: "Não foi possível gerar o link de pagamento no momento. Tente novamente mais tarde.",
      });
    } else {
      const [, amountArg] = trimmedMessage.split(/\s+/);
      const parsedAmount = Number(amountArg);
      const amountInCents =
        Number.isFinite(parsedAmount) && parsedAmount > 0
          ? Math.round(parsedAmount * 100)
          : 0;

      const payload = {
        amount: amountInCents || 1000,
        currency: "BRL",
        description: "Compra de créditos Show do Milênio via Telegram",
      };

      try {
        const pushinResponse = await fetch(
          "https://api.pushinpay.com/v1/payment-links",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${pushinpayApiKey}`,
            },
            body: JSON.stringify(payload),
          }
        );

        let paymentUrl: string | undefined;
        try {
          const responseData = await pushinResponse.json();
          paymentUrl =
            responseData?.url ??
            responseData?.data?.url ??
            responseData?.payment_link;
        } catch (parseError) {
          console.error(
            "[TelegramWebhook] Failed to parse PushinPay response",
            parseError
          );
        }

        if (!pushinResponse.ok || !paymentUrl) {
          console.error(
            "[TelegramWebhook] PushinPay request failed",
            pushinResponse.status
          );
          await sendTelegramMessage({
            botToken,
            chatId,
            text: "Não foi possível gerar o link de pagamento agora. Tente novamente em instantes.",
          });
        } else {
          await sendTelegramMessage({
            botToken,
            chatId,
            text: `Seu link de pagamento está pronto: ${paymentUrl}`,
          });
        }
      } catch (error) {
        console.error("[TelegramWebhook] Error creating payment link", error);
        await sendTelegramMessage({
          botToken,
          chatId,
          text: "Tivemos um problema ao criar o link de pagamento. Tente novamente mais tarde.",
        });
      }
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}


