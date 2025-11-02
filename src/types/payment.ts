export interface Payment {
  orderId: string; // ID primário do pedido (interno, único)
  referenceId: string; // ID de rastreio, consistente com o PagBank (reference_id)
  userId: string; // Chave estrangeira - ligação com a tabela de usuários
  totalAmount: number; // Valor total da transação (obrigatório)
  paymentStatus: string; // Status atual (atualizado SOMENTE pelo Webhook)
  pagbankOrderId: string; // ID retornado pelo PagBank
  pixQrCodeUrl: string; // URL da imagem do QR Code
  pixString: string; // Código "Copia e Cola"
  createdAt: Date; // Quando o pedido foi criado
  updatedAt: Date; // Última atualização
}

