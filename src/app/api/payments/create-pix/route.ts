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

const MP_BASE_URL = "https://api.mercadopago.com";

// --- Variáveis de Ambiente (Carregadas fora do handler) ---
const isProduction = process.env.NODE_ENV === 'production';
const mpAccessToken = isProduction 
    ? process.env.MP_ACCESS_TOKEN_PROD 
    : process.env.MP_ACCESS_TOKEN_SANDBOX;
const mpUserId = isProduction 
    ? process.env.MP_USER_ID_PROD 
    : process.env.MP_USER_ID_SANDBOX;
// -----------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    
    // --- 1. Validação e Configuração de Credenciais ---
    if (!mpAccessToken || !mpUserId) {
        return NextResponse.json(
            { success: false, error: 'Variáveis de ambiente do Mercado Pago (token/user ID) não configuradas' },
            { status: 500 }
        );
    }
    
    const body: CreatePixRequest = await request.json();
    
    // VALIDAÇÃO MÍNIMA (Não inclui todos os campos do Pagador para forçar o erro do MP)
    if (!body.userId || !body.totalAmount || body.totalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Dados obrigatórios (userId, totalAmount) faltando ou inválidos' },
        { status: 400 }
      );
    }

    const referenceId = randomUUID();
    const orderId = randomUUID();
    const notificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://seusite.com'}/api/payments/webhook-mp`;
    const transactionAmount = body.totalAmount / 100;

    // --- 2. Criar Registro no Firestore ---
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

    // --- 3. Criar PREFERÊNCIA (API REST com fetch) ---    
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
        operation_type: "split_payment",
        // 🔑 SPLIT DE PAGAMENTO (O que permite omitir o CNPJ do comprador)
        disbursements: [
            {
                collector_id: parseInt(mpUserId), // SEU ID DE USUÁRIO MP (collector_id)
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
        notification_url: notificationUrl,
        external_reference: referenceId,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
    };

    console.log('✅ [MP] MPPayloadPreference: ', mpPayloadPreference);
    console.log('✅ [MP] JSON.stringify(MPPayloadPreference): ', JSON.stringify(mpPayloadPreference));
    
    const preferenceResponse = await fetch(`${MP_BASE_URL}/checkout/preferences`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mpAccessToken}`,
        },
        body: JSON.stringify(mpPayloadPreference),
    });

    const preferenceData = await preferenceResponse.json();
    console.log('✅ [MP] PreferenceData: ', preferenceData);
    
    // Verificação de falha na criação da Preferência
    if (!preferenceResponse.ok || !preferenceData.id) {
        console.error('❌ [MP Error] Falha ao criar Preferência:', preferenceData);
        await adminDb.collection('payments').doc(orderId).update({
            paymentStatus: 'FAILED',
            errorDetails: preferenceData,
        });
        return NextResponse.json(
            { success: false, error: 'Erro ao criar preferência de pagamento no Mercado Pago', mpError: preferenceData },
            { status: preferenceResponse.status }
        );
    }
    const preferenceId = preferenceData.id;
    console.log('✅ [MP] PreferenceID: ', preferenceId);

    // --- 4. Criar PAGAMENTO PIX (API REST com fetch) ---  
    const xIdempotencyKey = randomUUID();
    const applicationFee = isProduction ? 0.01 : 1;
    const nameParts = body.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    const paymentPayload = {
        payment_method_id: 'pix',
        transaction_amount: transactionAmount,
        installments: 1,
        // 💰 REQUISITO DE SPLIT PARA CHECKOUT TRANSPARENTE:
        application_fee: applicationFee,
        payer: {
            first_name: firstName,
            last_name: lastName,
            email: body.email,
            identification: {
                type: body.documentType.toUpperCase(),
                number: body.documentValue.replace(/\D/g, ''),
            },
        }
    };

    console.log('✅ [MP] PaymentPayload: ', paymentPayload);
    console.log('✅ [MP] mpAccessToken: ', mpAccessToken);
    
    const paymentResponse = await fetch(`${MP_BASE_URL}/v1/payments?preference_id=${preferenceId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mpAccessToken}`,
            'x-idempotency-key': xIdempotencyKey,
        },
        body: JSON.stringify(paymentPayload),
    });
    
    const paymentDataResponse = await paymentResponse.json();

    if (!paymentResponse.ok) {
        console.error('❌ [MP Error] Falha ao gerar PIX:', paymentDataResponse);
        return NextResponse.json(
            { success: false, error: 'Erro ao gerar PIX após criação da Preferência', mpError: paymentDataResponse },
            { status: paymentResponse.status }
        );
    }
    
    // --- 5. Extração e Resposta ---
    
    const mpPaymentId = paymentDataResponse.id || '';
    const transactionData = paymentDataResponse.point_of_interaction?.transaction_data;
    
    if (!mpPaymentId || !transactionData) {
        throw new Error('Dados críticos do PIX não encontrados após a criação do Pagamento');
    }

    const pixString = transactionData.qr_code || '';
    const qrCodeBase64 = transactionData.qr_code_base64 || ''; 
    const pixQrCodeUrl = qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : '';

    // Atualizar documento no Firestore
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
    console.error('❌ [Internal Error] Erro ao criar cobrança PIX:', error.message);
    
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor ao criar cobrança PIX' },
      { status: 500 }
    );
  }
}