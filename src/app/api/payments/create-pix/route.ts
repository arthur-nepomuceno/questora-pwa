import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { randomUUID } from 'crypto';

interface CreatePixRequest {
  userId: string;
  totalAmount: number;
  creditsToReceive: number;
  documentValue: string;
  documentType: string;
  name: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [API Create PIX] Recebendo requisição...');
    
    const body: CreatePixRequest = await request.json();
    
    const requiredFields = {
      userId: body.userId,
      totalAmount: body.totalAmount,
      creditsToReceive: body.creditsToReceive,
      documentValue: body.documentValue,
      documentType: body.documentType,
      name: body.name,
      email: body.email,
    };

    const missingFields: string[] = [];
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      console.error('❌ [API Create PIX] Campos obrigatórios faltando:', missingFields);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campos obrigatórios faltando', 
          missingFields 
        },
        { status: 400 }
      );
    }

    if (typeof body.totalAmount !== 'number' || body.totalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'totalAmount deve ser um número positivo' },
        { status: 400 }
      );
    }

    if (typeof body.creditsToReceive !== 'number' || body.creditsToReceive <= 0) {
      return NextResponse.json(
        { success: false, error: 'creditsToReceive deve ser um número positivo' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    console.log('✅ [API Create PIX] Validações passadas');

    const referenceId = randomUUID();
    const orderId = randomUUID();

    console.log('🆔 [API Create PIX] IDs gerados:', { referenceId, orderId });

    // Lógica para obter token do Mercado Pago
    const isProduction = process.env.NODE_ENV === 'production';
    const mpAccessToken = isProduction 
        ? process.env.MP_ACCESS_TOKEN_PROD 
        : process.env.MP_ACCESS_TOKEN_SANDBOX;
    const mpBaseUrl = process.env.MP_API_BASE_URL || 'https://api.mercadopago.com';
    const apiEndpoint = `${mpBaseUrl}/v1/payments`;
    const notificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://seusite.com'}/api/payments/webhook-mp`;

    if (!mpAccessToken) {
      console.error('❌ [API Create PIX] ACCESS_TOKEN do Mercado Pago não configurado para o ambiente atual');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Configuração do Mercado Pago não encontrada' 
        },
        { status: 500 }
      );
    }
    
    // Preparar dados do cliente para o MP (nome completo)
    const nameParts = body.name.split(' ').filter(part => part.length > 0);
    const firstName = nameParts.length > 0 ? nameParts[0] : 'Cliente';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'App';
    
    // Valor da transação em Reais (Dividido por 100)
    const transactionAmount = body.totalAmount / 100;

    // Criar documento no Firestore na collection 'payments'
    const paymentData = {
      orderId,
      referenceId,
      userId: body.userId,
      totalAmount: transactionAmount, // Armazenar em Reais para consistência MP
      creditsToReceive: body.creditsToReceive,
      documentValue: body.documentValue,
      documentType: body.documentType,
      name: body.name,
      email: body.email,
      paymentStatus: 'PENDING',
      mpPaymentId: '', // NOVO CAMPO: Será preenchido quando o Mercado Pago responder
      pixQrCodeUrl: '',
      pixString: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      wouldExpireAt: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), // Expiração MP é tipicamente 1 hora
    };

    await adminDb.collection('payments').doc(orderId).set(paymentData);

    console.log('✅ [API Create PIX] Documento criado no Firestore com sucesso:', orderId);

    // Montar payload para o Mercado Pago (POST /v1/payments)
    const mpPayload = {
      transaction_amount: transactionAmount,
      description: `Compra de ${body.creditsToReceive} créditos`,
      payment_method_id: 'pix',
      external_reference: referenceId, // Usaremos o orderId do Firestore como referência externa
      notification_url: notificationUrl,
      payer: {
        email: body.email,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: body.documentType.toUpperCase(),
          number: body.documentValue.replace(/\D/g, ''),
        },
      },
    };

    console.log('📤 [API Create PIX] Enviando requisição para Mercado Pago...');
    console.log('📋 [API Create PIX] Payload:', JSON.stringify(mpPayload, null, 2));

    const mpResponse = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpAccessToken}`, // Usando o Access Token
        'X-Idempotency-Key': referenceId,
      },
      body: JSON.stringify(mpPayload),
    });

    let mpData;
    try {
      const text = await mpResponse.text();
      console.log('📥 [API Create PIX] Resposta bruta do MP:', text);
      mpData = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('❌ [API Create PIX] Erro ao parsear resposta JSON:', parseError);
      mpData = { error: 'Resposta inválida do Mercado Pago' };
    }

    console.log('📊 [API Create PIX] Status HTTP:', mpResponse.status);
    console.log('📊 [API Create PIX] Resposta parseada:', JSON.stringify(mpData, null, 2));

    if (!mpResponse.ok) {
      console.error('❌ [API Create PIX] Erro na resposta do Mercado Pago:');
      console.error('   - Status:', mpResponse.status);
      console.error('   - Body:', JSON.stringify(mpData, null, 2));
      
      await adminDb.collection('payments').doc(orderId).update({
        paymentStatus: 'FAILED',
        updatedAt: new Date(),
        errorDetails: mpData,
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao criar pagamento no Mercado Pago',
          mpError: mpData,
          httpStatus: mpResponse.status,
        },
        { status: mpResponse.status }
      );
    }

    console.log('✅ [API Create PIX] Resposta do Mercado Pago recebida:', JSON.stringify(mpData, null, 2));

    // Extrair dados do QR Code PIX da resposta do Mercado Pago
    const mpPaymentId = mpData.id || '';
    const transactionData = mpData.point_of_interaction?.transaction_data;
    
    if (!mpPaymentId || !transactionData) {
        console.error('❌ [API Create PIX] ID do pagamento ou dados da transação não encontrados na resposta do MP');
        throw new Error('Dados críticos do PIX não encontrados na resposta do Mercado Pago');
    }

    // EXTRAÇÃO: CÓDIGO COPIA E COLA (Texto) e QR Code em Base64 (Imagem)
    const pixString = transactionData.qr_code || '';
    const qrCodeBase64 = transactionData.qr_code_base64 || ''; // MP retorna a imagem em Base64

    console.log('📋 [API Create PIX] Dados extraídos:', {
      mpPaymentId,
      pixString: pixString ? `${pixString.substring(0, 50)}...` : 'VAZIO',
      qrCodeBase64Exists: !!qrCodeBase64,
    });

    // O Mercado Pago retorna a imagem em Base64. Precisamos formatar como URL de imagem
    const pixQrCodeUrl = qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : '';

    if (!pixString || !pixQrCodeUrl) {
      console.error('❌ [API Create PIX] Dados PIX incompletos!');

      await adminDb.collection('payments').doc(orderId).update({
        paymentStatus: 'FAILED',
        updatedAt: new Date(),
        errorDetails: {
          message: 'Dados do QR Code PIX incompletos na resposta do Mercado Pago',
          fullResponse: mpData,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Dados do QR Code PIX não foram retornados pelo Mercado Pago',
        },
        { status: 500 }
      );
    }

    // Atualizar documento no Firestore com dados do Mercado Pago
    await adminDb.collection('payments').doc(orderId).update({
      mpPaymentId, // Salvando o ID do pagamento do MP
      pixQrCodeUrl,
      pixString,
      updatedAt: new Date(),
    });

    console.log('✅ [API Create PIX] Documento atualizado com dados do Mercado Pago');

    return NextResponse.json({
      success: true,
      orderId,
      referenceId: referenceId,
      mpPaymentId: mpPaymentId, // Retornar o ID do pagamento do MP como referência
      pixQrCodeUrl,
      pixString,
      expirationDate: mpData.date_of_expiration, // O MP fornece o campo de expiração na resposta
      message: 'Cobrança PIX criada com sucesso',
      mpOrder: mpData,
    });

  } catch (error: any) {
    console.error('❌ [API Create PIX] Erro ao criar cobrança PIX:', error);
    console.error('❌ [API Create PIX] Detalhes do erro:', error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor ao criar cobrança PIX',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}