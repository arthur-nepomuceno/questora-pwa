import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// LOG: Verificar variáveis de ambiente
console.log('🔍 [Firebase Admin] Diagnóstico de inicialização:');
console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Configurado' : '❌ Faltando');
console.log('- FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Configurado' : '❌ Faltando');
console.log('- FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Configurado' : '❌ Faltando');

// Verificar se já existe uma instância do Firebase Admin
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ [Firebase Admin] Inicializado com sucesso');
  } catch (error) {
    console.error('❌ [Firebase Admin] Erro ao inicializar:', error);
    throw error;
  }
} else {
  console.log('ℹ️ [Firebase Admin] Já estava inicializado');
}

// Exportar instância do Firestore Admin
export const adminDb = getFirestore();
