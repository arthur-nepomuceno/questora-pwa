"use server";

import { NextRequest, NextResponse } from "next/server";

interface TelegramData {
  message?: {
    text?: string;
    chat?: {
      id: number;
      type?: string;
      username?: string;
      title?: string;
    };
  };
  // Incluído para futuras interações de botão
  callback_query?: {
    id: string;
    data: string;
    message?: {
      chat: { id: number };
    };
    from: { id: number };
  };
}

async function sendTelegramData({
  botToken,
  chatId,
  text,
  reply_markup, // <-- NOVO PARÂMETRO
}: {
  botToken: string;
  chatId: number;
  text: string;
  reply_markup?: object; // <-- NOVO TIPO
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
          reply_markup, // <-- INCLUÍDO NO BODY
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

  // VERIFICAÇÃO DE CREDENCIAIS: Leitura do cabeçalho oficial do Telegram
  const receivedSecret =
    request.headers.get("x-telegram-bot-api-secret-token") ??
    request.nextUrl.searchParams.get("secret") ??
    "";

  if (configuredSecret && receivedSecret !== configuredSecret) {
    console.warn("[TelegramWebhook] Invalid webhook secret received");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  //RECEBENDO E DECODIFICANDO OS DADOS DA REQUISIÇÃO DO TELEGRAM
  let telegramData: TelegramData | null = null;

  try {
    telegramData = (await request.json()) as TelegramData;
  } catch (error) {
    console.error("[TelegramWebhook] Failed to parse request body", error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  
  console.log("✅ Telegram Data:", telegramData);
  
  //CAPTURANDO OS DADOS IMPORTANTES DA REQUISIÇÃO
  const messageText = telegramData?.message?.text ?? "";
  const trimmedMessage = messageText.trim();  
  const chatId = telegramData?.message?.chat?.id;
  const callbackQuery = telegramData?.callback_query;  
  if (callbackQuery) {
      const packageId = callbackQuery.data; 
      console.log("✅ Escolha:", packageId);
      return NextResponse.json({ ok: true }); 
  }

  // LÓGICA DO /START (COM MENU INTERATIVO)
  if (botToken && chatId && trimmedMessage.startsWith("/start")) {
    const welcomeMessage =
      "Olá! Seja bem-vindo! Selecione um pacote para iniciar sua compra:";

    const inlineKeyboard = {
      inline_keyboard: [  
        [  
          { text: "300 créditos : R$2,99", callback_data: "pacote_de_300_creditos" },
        ],
        [
          { text: "500 créditos : R$4,99", callback_data: "pacote_de_500_creditos" },
        ],
        [
          { text: "700 créditos : R$6,99", callback_data: "pacote_de_700_creditos" },
        ],
        [
          { text: "1000 créditos : R$9,99", callback_data: "pacote_de_1000_creditos" },
        ],
        [
          { text: "2000 créditos : R$19,99", callback_data: "pacote_de_2000_creditos" },
        ],
        [
          { text: "3000 créditos : R$29,99", callback_data: "pacote_de_3000_creditos" },
        ],
        [
          { text: "5000 créditos : R$49,99", callback_data: "pacote_de_5000_creditos" },
        ],
        [
          { text: "10000 créditos : R$99,99", callback_data: "pacote_de_10000_creditos" },
        ],
      ],
    };  

    await sendTelegramData({
      botToken,
      chatId,
      text: welcomeMessage,
      reply_markup: inlineKeyboard,
    });
  }

  // O bloco /comprar deve ser adaptado no próximo passo
  if (botToken && chatId && trimmedMessage.startsWith("/comprar")) {
    if (!pushinpayApiKey) {
      console.error("[TelegramWebhook] Missing PUSHINPAY_API_KEY");
      await sendTelegramData({
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
          await sendTelegramData({
            botToken,
            chatId,
            text: "Não foi possível gerar o link de pagamento agora. Tente novamente em instantes.",
          });
        } else {
          await sendTelegramData({
            botToken,
            chatId,
            text: `Seu link de pagamento está pronto: ${paymentUrl}`,
          });
        }
      } catch (error) {
        console.error("[TelegramWebhook] Error creating payment link", error);
        await sendTelegramData({
          botToken,
          chatId,
          text: "Tivemos um problema ao criar o link de pagamento. Tente novamente mais tarde.",
        });
      }
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}