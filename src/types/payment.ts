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

export interface CashOut {
  id?: string; // ID gerado automaticamente pelo Firestore
  userId: string; // ID do usuário que está fazendo o saque
  value: number; // Valor do saque em centavos
  chavePix: string; // Chave PIX para recebimento
  status: 'pending' | 'done'; // Status do saque
  createdAt?: Date; // Data de criação
  updatedAt?: Date; // Data de atualização
}

