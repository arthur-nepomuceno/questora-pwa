import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { randomUUID } from 'crypto';
// CORREÇÃO: Usar require() para SDK CommonJS
const mercadopago = require('mercadopago'); 

interface CreatePixRequest {
  userId: string;
  totalAmount: number;
  creditsToReceive: number;
  documentValue: string;
  documentType: string;
  name: string;
  email: string;
}

// --- Variáveis de Ambiente ---
const isProduction = process.env.NODE_ENV === 'production';
const mpAccessToken = isProduction 
    ? process.env.MP_ACCESS_TOKEN_PROD 
    : process.env.MP_ACCESS_TOKEN_SANDBOX;
// -----------------------------

if (mpAccessToken) {
    // Inicialização do SDK no escopo global
    mercadopago.configure({
        access_token: mpAccessToken,
    });
}


export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [API Create PIX] Recebendo requisição...');
    
    const body: CreatePixRequest = await request.json();
    
    // ... (Validações omitidas por brevidade) ...
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

    // --- VARIÁVEIS DO SPLIT/MARKETPLACE ---
    const mpUserId = isProduction 
      ? process.env.MP_USER_ID_PROD 
      : process.env.MP_USER_ID_SANDBOX;

    if (!mpUserId) {
        console.error('❌ [API Create PIX] ID de usuário (MP_USER_ID) não configurado.');
        return NextResponse.json({ success: false, error: 'ID de usuário MP não encontrado' }, { status: 500 });
    }
    // ----------------------------------------

    console.log('✅ [API Create PIX] Validações passadas');

    const referenceId = randomUUID();
    const orderId = randomUUID();

    console.log('🆔 [API Create PIX] IDs gerados:', { referenceId, orderId });
    
    const notificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://seusite.com'}/api/payments/webhook-mp`;
    const transactionAmount = body.totalAmount / 100;

    // Criar documento no Firestore na collection 'payments'
    const paymentData = {
      orderId,
      referenceId,
      userId: body.userId,
      totalAmount: transactionAmount,
      creditsToReceive: body.creditsToReceive,
      documentValue: body.documentValue,
      documentType: body.documentType,
      name: body.name,
      email: body.email,
      paymentStatus: 'PENDING',
      mpPaymentId: '', 
      pixQrCodeUrl: '',
      pixString: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      wouldExpireAt: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), 
    };

    await adminDb.collection('payments').doc(orderId).set(paymentData);

    console.log('✅ [API Create PIX] Documento criado no Firestore com sucesso:', orderId);

    // --- MONTAGEM DO PAYLOAD DE PREFERÊNCIA PARA OCULTAR CNPJ ---
    const mpPayloadPreference = {
        items: [
            {
                title: `Compra de ${body.creditsToReceive} créditos`,
                quantity: 1,
                unit_price: transactionAmount,
            },
        ],
        payer: {
            name: body.name,
            email: body.email,
            identification: {
                type: body.documentType.toUpperCase(),
                number: body.documentValue.replace(/\D/g, ''),
            },
        },
        // --- SPLIT DE PAGAMENTO (Oculta o CNPJ) ---
        disbursements: [
            {
                collector_id: parseInt(mpUserId), // SEU ID DE USUÁRIO MP
                amount: transactionAmount, 
                external_reference: referenceId,
            }
        ],
        payment_methods: {
            excluded_payment_types: [
                { id: "credit_card" },
                { id: "debit_card" },
                { id: "ticket" }, 
                { id: "bank_transfer" } 
            ],
            installments: 1,
        },
        back_urls: {
            success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${orderId}`,
            pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending?order=${orderId}`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure?order=${orderId}`,
        },
        notification_url: notificationUrl,
        external_reference: referenceId,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
    };
    // --------------------------------------------------------------------------

    console.log('📤 [API Create PIX] Enviando requisição para Mercado Pago (Preferences)...');
    
    // 1. CRIA A PREFERÊNCIA
    const mpResponse = await mercadopago.preferences.create(mpPayloadPreference);
    const mpData = mpResponse.body;
    
    if (mpResponse.status !== 201) {
      console.error('❌ [API Create PIX] Erro na resposta do Mercado Pago (Preferences):');
      
      await adminDb.collection('payments').doc(orderId).update({
        paymentStatus: 'FAILED',
        updatedAt: new Date(),
        errorDetails: mpData,
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao criar preferência de pagamento no Mercado Pago',
          mpError: mpData,
          httpStatus: mpResponse.status,
        },
        { status: mpResponse.status }
      );
    }

    const preferenceId = mpData.id || '';
    if (!preferenceId) {
        throw new Error('ID da Preferência não encontrado na resposta do Mercado Pago');
    }

    // 2. CRIA O PAGAMENTO PIX USANDO A PREFERÊNCIA
    const paymentCreationResponse = await fetch(`${mercadopago.config.base_url}/v1/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mpAccessToken}`,
        },
        body: JSON.stringify({
            preference_id: preferenceId, // ID da Preferência criada
            payment_method_id: 'pix',
            transaction_amount: transactionAmount,
            installments: 1,
        }),
    });

    let paymentDataResponse;
    try {
        const text = await paymentCreationResponse.text();
        paymentDataResponse = text ? JSON.parse(text) : {};
    } catch (parseError) {
        console.error('❌ [API Create PIX] Erro ao parsear resposta JSON do pagamento:', parseError);
        paymentDataResponse = { error: 'Resposta inválida do Mercado Pago na criação do PIX' };
    }

    if (!paymentCreationResponse.ok) {
        console.error('❌ [API Create PIX] Erro na criação do PIX após Preferência:', paymentDataResponse);
        return NextResponse.json(
            { success: false, error: 'Erro ao gerar PIX após criação da Preferência' },
            { status: paymentCreationResponse.status }
        );
    }
    
    // --- EXTRAÇÃO FINAL (ID DO PAGAMENTO E DADOS DO PIX) ---
    const mpPaymentId = paymentDataResponse.id || '';
    const transactionData = paymentDataResponse.point_of_interaction?.transaction_data;
    
    if (!mpPaymentId || !transactionData) {
        throw new Error('Dados críticos do PIX não encontrados após a criação do Pagamento');
    }

    const pixString = transactionData.qr_code || '';
    const qrCodeBase64 = transactionData.qr_code_base64 || ''; 
    const pixQrCodeUrl = qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : '';

    if (!pixString || !pixQrCodeUrl) {
      return NextResponse.json(
        { success: false, error: 'Dados do QR Code PIX não foram retornados' },
        { status: 500 }
      );
    }

    // Atualizar documento no Firestore com dados do Mercado Pago
    await adminDb.collection('payments').doc(orderId).update({
      mpPaymentId, 
      pixQrCodeUrl,
      pixString,
      mpPreferenceId: preferenceId,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      orderId,
      referenceId: referenceId,
      mpPaymentId: mpPaymentId, 
      pixQrCodeUrl,
      pixString,
      expirationDate: paymentDataResponse.date_of_expiration, 
      message: 'Cobrança PIX criada com sucesso',
      mpOrder: paymentDataResponse,
    });

  } catch (error: any) {
    console.error('❌ [API Create PIX] Erro ao criar cobrança PIX:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor ao criar cobrança PIX',
      },
      { status: 500 }
    );
  }
}