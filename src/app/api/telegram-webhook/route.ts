"use server";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from '@/lib/firebase-admin';

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

interface CreditPackage {
  id: string;
  credits: number;
  totalAmount: number; // Já em centavos (ex: 299, 499)
  creditsToReceive: number;
  icon: string;
}

const creditPackages: CreditPackage[] = [
  { id: 'pacote_de_300_creditos', credits: 300, totalAmount: 299, creditsToReceive: 300, icon: '💰' },
  { id: 'pacote_de_500_creditos', credits: 500, totalAmount: 499, creditsToReceive: 500, icon: '💰' },
  { id: 'pacote_de_700_creditos', credits: 700, totalAmount: 699, creditsToReceive: 700, icon: '💰' },
  { id: 'pacote_de_1000_creditos', credits: 1000, totalAmount: 999, creditsToReceive: 1000, icon: '💎' },
  { id: 'pacote_de_2000_creditos', credits: 2000, totalAmount: 1999, creditsToReceive: 2000, icon: '💎' },
  { id: 'pacote_de_3000_creditos', credits: 3000, totalAmount: 2999, creditsToReceive: 3000, icon: '💎' },
  { id: 'pacote_de_5000_creditos', credits: 5000, totalAmount: 4999, creditsToReceive: 5000, icon: '🏆' },
  { id: 'pacote_de_10000_creditos', credits: 10000, totalAmount: 9999, creditsToReceive: 10000, icon: '🏆' },
];

const packageMap: Record<string, CreditPackage> = creditPackages.reduce((acc, pkg) => {
  acc[pkg.id] = pkg;
  return acc;
}, {} as Record<string, CreditPackage>);

//ENVIAR MENSAGENS PARA O TELEGRAM
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
          parse_mode: 'Markdown',
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

//RESPONDER À ESCOLHA DO PACOTE DE CRÉDITOS
async function answerCallbackQuery({
  botToken,
  callbackQueryId,
  text,
}: {
  botToken: string;
  callbackQueryId: string;
  text?: string;
}) {
  try {
    await fetch(
      `https://api.telegram.org/bot${botToken}/answerCallbackQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: text,
          show_alert: false,
        }),
      }
    );
  } catch (error) {
    console.error("[TelegramWebhook] Error answering callback query", error);
  }
}

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const pushinpayApiKey = process.env.PUSHINPAY_API_KEY;
  const receivedSecret =
  request.headers.get("x-telegram-bot-api-secret-token") ??
  request.nextUrl.searchParams.get("secret") ??
  "";

  // VERIFICAÇÃO DE CREDENCIAIS
  if (!configuredSecret) {
    console.error("[TelegramWebhook] Missing TELEGRAM_WEBHOOK_SECRET");
  }

  if (!botToken) {
    console.error("[TelegramWebhook] Missing TELEGRAM_BOT_TOKEN");
  }

  if (configuredSecret && receivedSecret !== configuredSecret) {
    console.warn("[TelegramWebhook] Invalid webhook secret received");
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  //

  //RECEBENDO OS DADOS DA REQUISIÇÃO DO TELEGRAM
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

  //CAPTURANDO A ESCOLHA DO PACOTE DE CRÉDITOS E PASSANDO AO PSP
  const callbackQuery = telegramData?.callback_query;  
  if (botToken && callbackQuery) {
      const packageId = callbackQuery.data; 
      const chatId = callbackQuery.message?.chat.id ?? callbackQuery.from.id;
      const selectedPackage = packageMap[packageId];
      console.log("✅ Escolha:", packageId);

      // 1. Responde ao Telegram para fechar o loading
      await answerCallbackQuery({
        botToken,
        callbackQueryId: callbackQuery.id,
        text: "Gerando link de pagamento...",
      });

      if (selectedPackage && pushinpayApiKey) {
        // 2. Prepara o payload para PushinPay
        const payloadRequest = {
          value: selectedPackage.totalAmount, // Valor em centavos
          webhook_url: process.env.PUSHINPAY_WEBHOOK_URL || "", 
          split_rules: [],
        };


        try {
          // 3. CHAMA A API PUSHINPAY
          const pushinResponse = await fetch(
            "https://api.pushinpay.com.br/api/pix/cashIn",
            {
              method: "POST",
              headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${pushinpayApiKey}`,
              },
              body: JSON.stringify(payloadRequest),
            }
          );

          const responseData = await pushinResponse.json();
          console.log("✅ Response Data:", responseData);
          
          // Salvar dados no Firestore
          const paymentData = {
            telegramChatId: callbackQuery.message?.chat.id,
            pspTransactionId: responseData.id,
            status: 'pending',
            totalAmount: responseData.value,
            creditsToReceive: selectedPackage.creditsToReceive,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          await adminDb.collection('payments').doc(responseData.id || `payment_${Date.now()}`).set(paymentData);
          
          const pixCode = responseData?.qr_code;

          // 4. ENVIA O LINK PIX/QR CODE DE VOLTA
          if (pixCode) {
            const price = (selectedPackage.totalAmount / 100).toFixed(2).replace('.', ',');

            const caption = 
            `💰 **Pagamento Pix - ${selectedPackage.credits} Créditos**\n` +
            `Valor: *R$${price}*\n\n` +
            `Use o código Pix (Copia e Cola):\n\n` +
            `\`${pixCode}\``;

            await sendTelegramData({
              botToken,
              chatId,
              text: caption,
            });
          } else {
            console.error("[PushinPay Error] Pix data missing. Response:", JSON.stringify(responseData));
            throw new Error("Dados Pix (QR Code ou código) indisponíveis na resposta.");
          }
        } catch (error) {
          console.error("[TelegramWebhook] Erro ao criar link PushinPay:", error);
          await sendTelegramData({
            botToken,
            chatId,
            text: "❌ Não foi possível gerar o link de pagamento. Tente novamente mais tarde.",
          });
        }
      }

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

  return NextResponse.json({ ok: true }, { status: 200 });
}