import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 [API] Buscando dados do usuário:', userId);

    // Buscar dados do usuário no Firestore usando Firebase Admin SDK
    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const name = userData?.name || '';
    const email = userData?.email || '';

    console.log('✅ [API] Dados do usuário encontrados:', { name, email });

    return NextResponse.json({
      success: true,
      name,
      email,
    });

  } catch (error: any) {
    console.error('❌ [API] Erro ao buscar dados do usuário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

