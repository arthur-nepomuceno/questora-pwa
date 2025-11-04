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
    
    // Validação de dados obrigatórios
    const requiredFields = {
      userId: body.userId,
      totalAmount: body.totalAmount,
      creditsToReceive: body.creditsToReceive,
      documentValue: body.documentValue,
      documentType: body.documentType,
      name: body.name,
      email: body.email,
    };

    // Verificar se todos os campos foram fornecidos
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

    // Validação de tipos
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

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    console.log('✅ [API Create PIX] Validações passadas');

    // Geração de IDs únicos
    const referenceId = randomUUID(); // UUID para PagBank
    const orderId = randomUUID(); // UUID distinto para Firestore

    console.log('🆔 [API Create PIX] IDs gerados:', { referenceId, orderId });

    // Calcular data de expiração (1 hora depois)
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1);
    const expirationDateISO = expirationTime.toISOString().slice(0, 19) + '-03:00';

    // Criar documento no Firestore na collection 'payments'
    const paymentData = {
      orderId,
      referenceId,
      userId: body.userId,
      totalAmount: body.totalAmount,
      creditsToReceive: body.creditsToReceive,
      documentValue: body.documentValue,
      documentType: body.documentType,
      name: body.name,
      email: body.email,
      paymentStatus: 'PENDING',
      pagbankOrderId: '', // Será preenchido quando o PagBank responder
      pixQrCodeUrl: '', // Será preenchido quando o PagBank responder
      pixString: '', // Será preenchido quando o PagBank responder
      createdAt: new Date(),
      updatedAt: new Date(),
      wouldExpireAt: expirationDateISO,
    };

    // Usar orderId como ID do documento no Firestore
    await adminDb.collection('payments').doc(orderId).set(paymentData);

    console.log('✅ [API Create PIX] Documento criado no Firestore com sucesso:', orderId);

    // Montar payload para o PagBank
    const pagbankPayload = {
      reference_id: referenceId,
      customer: {
        name: body.name,
        email: body.email,
        tax_id: body.documentValue.replace(/\D/g, ''), // Remover formatação (apenas dígitos)
      },
      qr_codes: [{
        amount: {
          value: body.totalAmount, // Valor já está em centavos
        },
        expiration_date: expirationDateISO,
      }],
      notification_urls: [
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://show-do-milenio.vercel.app'}/api/payments/webhook-confirm`,
      ],
    };

    console.log('📤 [API Create PIX] Enviando requisição para PagSeguro...');
    console.log('📋 [API Create PIX] Payload:', JSON.stringify(pagbankPayload, null, 2));

    // Fazer chamada ao PagSeguro
    console.log('🔍 [API Create PIX] Verificando variável de ambiente...');
    const pagbankToken = process.env.PAGBANK_ACCESS_TOKEN;
    console.log('🔍 [API Create PIX] Token existe?', pagbankToken ? 'SIM' : 'NÃO');
    console.log('🔍 [API Create PIX] Token é undefined?', pagbankToken === undefined);
    console.log('🔍 [API Create PIX] Token é null?', pagbankToken === null);
    console.log('🔍 [API Create PIX] Token é string vazia?', pagbankToken === '');
    
    if (!pagbankToken) {
      console.error('❌ [API Create PIX] PAGBANK_ACCESS_TOKEN não configurado');
      console.error('❌ [API Create PIX] Valor do token:', pagbankToken);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Configuração do PagBank não encontrada' 
        },
        { status: 500 }
      );
    }

    console.log('🔑 [API Create PIX] Token PagSeguro:', pagbankToken);
    console.log('🔑 [API Create PIX] Token length:', pagbankToken.length);
    console.log('🔑 [API Create PIX] Primeiros 10 caracteres:', pagbankToken.substring(0, 10) + '...');

    const pagbankResponse = await fetch('https://sandbox.api.pagseguro.com/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pagbankToken}`,
      },
      body: JSON.stringify(pagbankPayload),
    });

    // Tentar parsear resposta JSON
    let pagbankData;
    try {
      const text = await pagbankResponse.text();
      console.log('📥 [API Create PIX] Resposta bruta do PagSeguro:', text);
      pagbankData = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('❌ [API Create PIX] Erro ao parsear resposta JSON:', parseError);
      pagbankData = { error: 'Resposta inválida do PagSeguro' };
    }

    console.log('📊 [API Create PIX] Status HTTP:', pagbankResponse.status);
    console.log('📊 [API Create PIX] Resposta parseada:', JSON.stringify(pagbankData, null, 2));

    if (!pagbankResponse.ok) {
      console.error('❌ [API Create PIX] Erro na resposta do PagSeguro:');
      console.error('   - Status:', pagbankResponse.status);
      console.error('   - Status Text:', pagbankResponse.statusText);
      console.error('   - Body:', JSON.stringify(pagbankData, null, 2));
      
      // Atualizar status do pagamento para FAILED
      await adminDb.collection('payments').doc(orderId).update({
        paymentStatus: 'FAILED',
        updatedAt: new Date(),
        errorDetails: pagbankData,
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao criar ordem no PagSeguro',
          pagbankError: pagbankData,
          httpStatus: pagbankResponse.status,
          debug: {
            tokenExists: !!pagbankToken,
            tokenLength: pagbankToken?.length || 0,
            tokenPreview: pagbankToken ? `${pagbankToken.substring(0, 10)}...` : 'N/A',
            tokenFull: pagbankToken, // APENAS PARA DEBUG - REMOVER EM PRODUÇÃO
          },
        },
        { status: pagbankResponse.status }
      );
    }

    console.log('✅ [API Create PIX] Resposta do PagSeguro recebida:', JSON.stringify(pagbankData, null, 2));

    // Extrair dados do QR Code PIX da resposta
    const qrCode = pagbankData.qr_codes?.[0];
    const pagbankOrderId = pagbankData.id || pagbankData.order_id || '';
    const pixQrCodeUrl = qrCode?.qr_code_image || qrCode?.image_url || '';
    const pixString = qrCode?.text || qrCode?.qr_code || '';

    // Atualizar documento no Firestore com dados do PagBank
    await adminDb.collection('payments').doc(orderId).update({
      pagbankOrderId,
      pixQrCodeUrl,
      pixString,
      updatedAt: new Date(),
    });

    console.log('✅ [API Create PIX] Documento atualizado com dados do PagBank');

    return NextResponse.json({
      success: true,
      orderId,
      referenceId,
      pagbankOrderId,
      pixQrCodeUrl,
      pixString,
      expirationDate: expirationDateISO,
      message: 'Cobrança PIX criada com sucesso',
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

