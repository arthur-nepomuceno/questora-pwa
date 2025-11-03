export interface Payment {
  orderId: string; // ID primário do pedido (interno, único)
  referenceId: string; // ID de rastreio, consistente com o PagBank (reference_id)
  userId: string; // Chave estrangeira - ligação com a tabela de usuários
  totalAmount: number; // Valor total da transação (obrigatório)
  creditsToReceive: number; // Quantidade de créditos a receber
  documentValue: string; // Valor do documento (CPF/CNPJ)
  documentType: string; // Tipo do documento (CPF ou CNPJ)
  name: string; // Nome do comprador
  email: string; // Email do comprador
  paymentStatus: string; // Status atual (atualizado SOMENTE pelo Webhook)
  pagbankOrderId: string; // ID retornado pelo PagBank
  pixQrCodeUrl: string; // URL da imagem do QR Code
  pixString: string; // Código "Copia e Cola"
  createdAt: Date; // Quando o pedido foi criado
  updatedAt: Date; // Última atualização
}

