export interface Payment {
  orderId: string; // ID primário do pedido (interno, único)
  userId: string; // Chave estrangeira - ligação com a tabela de usuários
  userName: string; // Nome do comprador
  userEmail: string; // Email do comprador
  userCreditsBeforePurchase: number; // Créditos do usuário antes da compra
  chatId?: number; // ID do chat do Telegram
  pspId: string; // ID retornado pelo PSP (PushinPay)
  pixCode: string; // Código do QR Code do PIX
  status: string; // Status atual (atualizado SOMENTE pelo Webhook)
  totalAmount: number; // Valor total da transação (obrigatório)
  creditsToReceive: number; // Quantidade de créditos a receber
  createdAt: Date; // Quando o pedido foi criado
  updatedAt: Date; // Última atualização
}

