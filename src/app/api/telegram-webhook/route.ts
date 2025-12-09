"use server";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from '@/lib/firebase-admin';
import { TelegramData, packageMap, sendTelegramData, answerCallbackQuery } from '@/lib/telegram-utils';

export async function POST(request: NextRequest) {
  console.log("🚨🚨🚨 [TelegramWebhook] FUNÇÃO POST CHAMADA");
  
  let telegramData: TelegramData | null = null;
  
  const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const pushinpayApiKey = process.env.PUSHINPAY_API_KEY;    
  const receivedSecret = request.headers.get("x-telegram-bot-api-secret-token") 
  ?? request.nextUrl.searchParams.get("secret") 
  ?? "";

  console.log("🚨🚨🚨 [TelegramWebhook] Verificando credenciais...");

  // VERIFICAÇÃO DE CREDENCIAIS
  if (!configuredSecret) {
    console.error("[TelegramWebhook] Missing TELEGRAM_WEBHOOK_SECRET");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (!botToken) {
    console.error("[TelegramWebhook] Missing TELEGRAM_BOT_TOKEN");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (configuredSecret && receivedSecret !== configuredSecret) {
    console.warn("[TelegramWebhook] Invalid webhook secret received");
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  ////////////////////////////////////////////////////////////////////

  console.log("🚨🚨🚨 [TelegramWebhook] Credenciais OK, parseando body...");

  //RECEBENDO OS DADOS DE RESPOSTA AO ABRIR A URL DO TELEGRAM
  try {
    telegramData = (await request.json()) as TelegramData;
    console.log("✅ Telegram Data:", telegramData);
    console.log("🚨🚨🚨 [TelegramWebhook] Body parseado com sucesso");
  } catch (error) {
    console.error("[TelegramWebhook] Failed to parse request body", error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  
  const chatId = telegramData?.message?.chat?.id;
  const messageText = telegramData?.message?.text ?? "<command> <token>";
  const [command, token] = messageText.split(' ');  
  console.log("✅ Command:", command);
  console.log("✅ Token:", token);
  ////////////////////////////////////////////////////////////////////
  
  
  //BUSCAR O USER PELO TOKEN;
  //////////////////////////

  // RECEBE COMANDO /START E RESPONDE COM MENU DE PACOTES
  if (command === "/start" && botToken && chatId) {
    // Retry logic para resolver race condition: token pode não estar salvo ainda
    let userDoc = null;
    let userId: string | undefined;
    let userName: string | undefined;
    let userEmail: string | undefined;
    let userCreditsBeforePurchase: number | undefined;
    
    const maxRetries = 3;
    const retryDelay = 1000; // 1 segundo
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      if (token && token.trim() !== '') {
        const userSnapshot = await adminDb.collection('users').where('purchaseToken', '==', token).get();
        userDoc = userSnapshot.docs[0];
        
        if (userDoc) {
          userId = userDoc.id;
          const userData = userDoc.data();
          userName = userData.name;
          userEmail = userData.email;
          userCreditsBeforePurchase = userData.totalCredits;
          console.log(`✅ Token encontrado na tentativa ${attempt}`);
          break;
        } else {
          console.log(`⚠️ Token não encontrado na tentativa ${attempt}/${maxRetries}`);
          if (attempt < maxRetries) {
            console.log(`⏳ Aguardando ${retryDelay}ms antes de tentar novamente...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      } else {
        console.warn('⚠️ Token vazio ou undefined');
        break;
      }
    }
    
    // Se ainda não encontrou o usuário após todas as tentativas
    if (!userDoc || !userId) {
      console.error('❌ Usuário não encontrado após todas as tentativas. Token:', token);
      await sendTelegramData({
        botToken,
        chatId,
        text: '❌ Não foi possível identificar seu usuário. Por favor, tente novamente em alguns instantes.',
      });
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Atualizar chatId no documento do usuário
    if (userId) {
      await adminDb.collection('users').doc(userId).update({
        chatId: chatId
      });
    }

    console.log("✅ User ID:", userId);
    console.log("✅ User Name:", userName);
    console.log("✅ User Email:", userEmail);
    console.log("✅ User Total Credits:", userCreditsBeforePurchase);

    // Extrair os 16 primeiros caracteres do token
    const tokenHash = token ? token.substring(0, 16) : '';
    console.log("✅ Token Hash (16 primeiros caracteres):", tokenHash);

    const welcomeMessage =
      `Olá ${userName}! Selecione um pacote para iniciar sua compra:`;

    const inlineKeyboard = {
      inline_keyboard: [  
        [  
          { text: "50 créditos : R$0,50", callback_data: `pacote_de_50_creditos|${tokenHash}` },
        ],
        [  
          { text: "300 créditos : R$2,99", callback_data: `pacote_de_300_creditos|${tokenHash}` },
        ],
        [
          { text: "500 créditos : R$4,99", callback_data: `pacote_de_500_creditos|${tokenHash}` },
        ],
        [
          { text: "700 créditos : R$6,99", callback_data: `pacote_de_700_creditos|${tokenHash}` },
        ],
        [
          { text: "1000 créditos : R$9,99", callback_data: `pacote_de_1000_creditos|${tokenHash}` },
        ],
        [
          { text: "2000 créditos : R$19,99", callback_data: `pacote_de_2000_creditos|${tokenHash}` },
        ],
        [
          { text: "3000 créditos : R$29,99", callback_data: `pacote_de_3000_creditos|${tokenHash}` },
        ],
        [
          { text: "5000 créditos : R$49,99", callback_data: `pacote_de_5000_creditos|${tokenHash}` },
        ],
        [
          { text: "10000 créditos : R$99,99", callback_data: `pacote_de_10000_creditos|${tokenHash}` },
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
  ////////////////////////////////////////////////////////////////////

  //RECEBE A ESCOLHA DE PACOTE DE CRÉDITOS E PASSA AO PSP
  const callbackQuery = telegramData?.callback_query;  
  console.log("🚨🚨🚨 [TelegramWebhook] callbackQuery existe?", !!callbackQuery);
  
  if (botToken && callbackQuery) {
      console.log("🚨🚨🚨 [TelegramWebhook] Entrando no bloco de callback_query");
      const callbackData = callbackQuery.data; 
      console.log("🚨🚨🚨 [TelegramWebhook] callbackData completo:", callbackData);
      const chatId = callbackQuery.message?.chat.id ?? callbackQuery.from.id;
      
      // Extrair packageId e tokenHash do callback_data
      const [packageId, tokenHash] = callbackData?.split('|') || [callbackData, ''];
      const selectedPackage = packageMap[packageId];
      console.log("✅ Escolha:", packageId);
      console.log("✅ Token Hash recebido:", tokenHash);

      // 1. Responde ao Telegram para fechar o loading
      await answerCallbackQuery({
        botToken,
        callbackQueryId: callbackQuery.id,
        text: "Gerando link de pagamento...",
      });

      // 2. Prepara o payload para PushinPay
      if (selectedPackage && pushinpayApiKey) {
        const payloadRequest = {
          value: selectedPackage.totalAmount, // Valor em centavos
          webhook_url: process.env.PUSHINPAY_WEBHOOK_URL || "", 
          split_rules: [],
        };

        // 3. Envia para o PUSHINPAY
        try {
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
          const pixCode = responseData?.qr_code;
          console.log("✅ Response Data:", responseData);
          
          // 4. Envia o link do PIX para o cliente
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

          // 5. Busca userId do cliente para salvar no Firestore usando tokenHash
          console.log('🔍 [TelegramWebhook] Buscando usuário pelo tokenHash (16 primeiros caracteres):', tokenHash);
          
          // Buscar todos os usuários e filtrar pelos primeiros 16 caracteres do purchaseToken
          const allUsersSnapshot = await adminDb.collection('users').get();
          let userDoc = null;
          
          for (const doc of allUsersSnapshot.docs) {
            const userData = doc.data();
            const userToken = userData.purchaseToken || '';
            if (userToken.substring(0, 16) === tokenHash) {
              userDoc = doc;
              break;
            }
          }
          
          if (!userDoc) {
            console.error('❌ [TelegramWebhook] Usuário não encontrado com tokenHash:', tokenHash);
            await sendTelegramData({
              botToken,
              chatId,
              text: "❌ Não foi possível identificar seu usuário. Por favor, envie /start novamente.",
            });
            return NextResponse.json({ ok: true }, { status: 200 });
          }
          
          const userId = userDoc.id;
          console.log('🔍 [TelegramWebhook] userId encontrado:', userId);
          const userName = userDoc.data().name;
          const userEmail = userDoc.data().email;
          const userCreditsBeforePurchase = userDoc.data().totalCredits;
          console.log('🔍 [TelegramWebhook] Dados do usuário encontrado:', { userId, userName, userEmail, userCreditsBeforePurchase });
          const paymentRef = adminDb.collection('payments').doc();

          // Salvar dados no Firestore
          const paymentData = {
            orderId: paymentRef.id,
            userId,
            userName,
            userEmail,
            userCreditsBeforePurchase,
            chatId: callbackQuery.message?.chat.id,
            pspId: responseData.id?.toLowerCase(),
            pixCode,
            status: 'pending',
            totalAmount: responseData.value,
            creditsToReceive: selectedPackage.creditsToReceive,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          console.log('🔍 [TelegramWebhook] paymentData ANTES DE SALVAR:', JSON.stringify(paymentData, null, 2));
          await paymentRef.set(paymentData);
          console.log('🔍 [TelegramWebhook] paymentData DEPOIS DE SALVAR - orderId:', paymentData.orderId);          

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
  ////////////////////////////////////////////////////////////////////

  return NextResponse.json({ ok: true }, { status: 200 });
}