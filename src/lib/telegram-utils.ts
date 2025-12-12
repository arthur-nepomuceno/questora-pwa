export interface TelegramData {
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

export interface CreditPackage {
  id: string;
  credits: number;
  totalAmount: number; // Já em centavos (ex: 299, 499)
  creditsToReceive: number;
  icon: string;
}

export const creditPackages: CreditPackage[] = [
  { id: 'pacote_de_300_creditos', credits: 300, totalAmount: 299, creditsToReceive: 300, icon: '💰' },
  { id: 'pacote_de_500_creditos', credits: 500, totalAmount: 499, creditsToReceive: 500, icon: '💰' },
  { id: 'pacote_de_700_creditos', credits: 700, totalAmount: 699, creditsToReceive: 700, icon: '💰' },
  { id: 'pacote_de_1000_creditos', credits: 1000, totalAmount: 999, creditsToReceive: 1000, icon: '💎' },
  { id: 'pacote_de_2000_creditos', credits: 2000, totalAmount: 1999, creditsToReceive: 2000, icon: '💎' },
  { id: 'pacote_de_3000_creditos', credits: 3000, totalAmount: 2999, creditsToReceive: 3000, icon: '💎' },
  { id: 'pacote_de_5000_creditos', credits: 5000, totalAmount: 4999, creditsToReceive: 5000, icon: '🏆' },
  { id: 'pacote_de_10000_creditos', credits: 10000, totalAmount: 9999, creditsToReceive: 10000, icon: '🏆' },
];

export const packageMap: Record<string, CreditPackage> = creditPackages.reduce((acc, pkg) => {
  acc[pkg.id] = pkg;
  return acc;
}, {} as Record<string, CreditPackage>);

//ENVIAR MENSAGENS PARA O TELEGRAM
export async function sendTelegramData({
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
export async function answerCallbackQuery({
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

