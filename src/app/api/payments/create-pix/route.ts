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
    };

    // Usar orderId como ID do documento no Firestore
    await adminDb.collection('payments').doc(orderId).set(paymentData);

    console.log('✅ [API Create PIX] Documento criado no Firestore com sucesso:', orderId);

    return NextResponse.json({
      success: true,
      orderId,
      referenceId,
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

