import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs, runTransaction, updateDoc } from 'firebase/firestore';
import { CashOut } from '@/types/payment';

interface CreditPackages {
  creditPackage100?: number;
  creditPackage300?: number;
  creditPackage500?: number;
  creditPackage700?: number;
  creditPackage1000?: number;
  creditPackage1500?: number;
  creditPackage2000?: number;
  creditPackage3000?: number;
}

/**
 * Calcula o total de créditos utilizados baseado nos campos creditPackage
 * @param creditPackages - Objeto com os campos creditPackage do usuário
 * @returns Total de créditos utilizados
 */
function calculateTotalCreditsUsed(creditPackages: CreditPackages): number {
  const package100 = (creditPackages.creditPackage100 || 0) * 100;
  const package300 = (creditPackages.creditPackage300 || 0) * 300;
  const package500 = (creditPackages.creditPackage500 || 0) * 500;
  const package700 = (creditPackages.creditPackage700 || 0) * 700;
  const package1000 = (creditPackages.creditPackage1000 || 0) * 1000;
  const package1500 = (creditPackages.creditPackage1500 || 0) * 1500;
  const package2000 = (creditPackages.creditPackage2000 || 0) * 2000;
  const package3000 = (creditPackages.creditPackage3000 || 0) * 3000;
  
  const total = package100 + package300 + package500 + package700 + 
                package1000 + package1500 + package2000 + package3000;
  
  console.log('📊 [cashOut] Totais de créditos por pacote:');
  console.log('  - creditPackage100:', creditPackages.creditPackage100 || 0, 'x 100 =', package100);
  console.log('  - creditPackage300:', creditPackages.creditPackage300 || 0, 'x 300 =', package300);
  console.log('  - creditPackage500:', creditPackages.creditPackage500 || 0, 'x 500 =', package500);
  console.log('  - creditPackage700:', creditPackages.creditPackage700 || 0, 'x 700 =', package700);
  console.log('  - creditPackage1000:', creditPackages.creditPackage1000 || 0, 'x 1000 =', package1000);
  console.log('  - creditPackage1500:', creditPackages.creditPackage1500 || 0, 'x 1500 =', package1500);
  console.log('  - creditPackage2000:', creditPackages.creditPackage2000 || 0, 'x 2000 =', package2000);
  console.log('  - creditPackage3000:', creditPackages.creditPackage3000 || 0, 'x 3000 =', package3000);
  console.log('📊 [cashOut] Somatório final:', total);
  
  return total;
}

/**
 * Converte valor formatado brasileiro (9.999,99) para centavos (inteiro)
 * @param valorFormatado - Valor no formato "9.999,99"
 * @returns Valor em centavos (número inteiro)
 */
export function converterValorParaCentavos(valorFormatado: string): number {
  // Remove pontos e vírgula, mantém apenas dígitos
  const valorLimpo = valorFormatado.replace(/[^\d]/g, '');
  
  // Converte para número inteiro (já está em centavos)
  return parseInt(valorLimpo, 10);
}

/**
 * Registra uma solicitação de saque na coleção cashOut do Firestore
 * @param userId - ID do usuário que está fazendo o saque
 * @param valorFormatado - Valor do saque no formato brasileiro "9.999,99"
 * @param chavePix - Chave PIX para recebimento
 * @returns ID do documento criado
 */
export async function createCashOutRequest(
  userId: string,
  valorFormatado: string,
  chavePix: string
): Promise<string> {
  try {
    // Converter valor formatado para centavos
    const value = converterValorParaCentavos(valorFormatado);
    
    // Validar se o valor é maior que zero
    if (value <= 0) {
      throw new Error('O valor do saque deve ser maior que zero');
    }
    
    // Validar se a chave PIX foi preenchida
    if (!chavePix || chavePix.trim() === '') {
      throw new Error('A chave PIX é obrigatória');
    }
    
    // Buscar campos creditPackage do usuário no Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('Usuário não encontrado');
    }
    
    const userData = userDoc.data();
    const totalCredits = userData.totalCredits || userData.credits || 0;
    
    // Validar se o valor do saque é menor que (total de créditos - 300)
    // O usuário deve deixar pelo menos 300 créditos na conta após o saque
    const maxValueAllowed = totalCredits - 299;
    if (value > maxValueAllowed) {
      const maxValueInReais = (maxValueAllowed / 100).toFixed(2).replace('.', ',');
      throw new Error(`Valor de saque incompatível com o saldo disponível. Você deve deixar pelo menos R$2,99 em créditos na conta. Você pode sacar até R$ ${maxValueInReais}. `);
    }
    
    const creditPackages: CreditPackages = {
      creditPackage100: userData.creditPackage100 || userData.creditGames100 || 0,
      creditPackage300: userData.creditPackage300 || userData.creditGames300 || 0,
      creditPackage500: userData.creditPackage500 || userData.creditGames500 || 0,
      creditPackage700: userData.creditPackage700 || userData.creditGames700 || 0,
      creditPackage1000: userData.creditPackage1000 || userData.creditGames1000 || 0,
      creditPackage1500: userData.creditPackage1500 || userData.creditGames1500 || 0,
      creditPackage2000: userData.creditPackage2000 || userData.creditGames2000 || 0,
      creditPackage3000: userData.creditPackage3000 || userData.creditGames3000 || 0,
    };
    
    // Calcular total de créditos utilizados
    const totalCreditsUsed = calculateTotalCreditsUsed(creditPackages);
    
    // Validar se o usuário utilizou no mínimo 2000 créditos
    if (totalCreditsUsed < 2000) {
      throw new Error('Você precisa ter utilizado no mínimo 2000 créditos para solicitar um saque');
    }
    
    // Buscar todos os pagamentos do usuário com status "paid"
    console.log('💳 [cashOut] Buscando pagamentos do usuário com status "paid"...');
    const paymentsQuery = query(
      collection(db, 'payments'),
      where('userId', '==', userId),
      where('status', '==', 'paid')
    );
    
    const paymentsSnapshot = await getDocs(paymentsQuery);
    const payments = paymentsSnapshot.docs.map(doc => doc.data());
    
    // Somar totalAmount de todos os pagamentos pagos
    const totalAmountPaid = payments.reduce((sum, payment) => {
      const amount = payment.totalAmount || 0;
      return sum + amount;
    }, 0);
    
    console.log('💳 [cashOut] Total de pagamentos encontrados:', payments.length);
    console.log('💳 [cashOut] Total pago (centavos):', totalAmountPaid);
    console.log('💳 [cashOut] Total pago (reais):', (totalAmountPaid / 100).toFixed(2));
    
    // Validar se o usuário inseriu pelo menos 10 reais (999 centavos)
    if (totalAmountPaid < 999) {
      throw new Error('Você precisa ter inserido pelo menos R$ 10,00 em créditos na plataforma para solicitar um saque');
    }
    
    // Preparar referências dos documentos
    const userRef = doc(db, 'users', userId);
    const cashOutRef = doc(collection(db, 'cashOut'));
    
    // Executar transação: criar cashOut e debitar créditos atomicamente
    await runTransaction(db, async (transaction) => {
      // Ler documento do usuário dentro da transação para garantir consistência
      const userSnapshot = await transaction.get(userRef);
      if (!userSnapshot.exists()) {
        throw new Error('Usuário não encontrado');
      }
      
      const currentUserData = userSnapshot.data();
      const currentTotalCredits = currentUserData.totalCredits || currentUserData.credits || 0;
      
      // Validar novamente o saldo dentro da transação (pode ter mudado)
      const maxValueAllowed = currentTotalCredits - 299;
      if (value > maxValueAllowed) {
        const maxValueInReais = (maxValueAllowed / 100).toFixed(2).replace('.', ',');
        throw new Error(`Valor de saque incompatível com o saldo disponível. Você deve deixar pelo menos R$2,99 em créditos na conta. Você pode sacar até R$ ${maxValueInReais}. `);
      }
      
      // Calcular novo total de créditos após o débito
      const newTotalCredits = currentTotalCredits - value;
      
      // Criar documento cashOut
      transaction.set(cashOutRef, {
        userId,
        value,
        chavePix: chavePix.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Debitar créditos do usuário
      transaction.update(userRef, {
        totalCredits: newTotalCredits,
      });
    });
    
    console.log('✅ [cashOut] Solicitação de saque criada com sucesso. ID:', cashOutRef.id);
    console.log('✅ [cashOut] Créditos debitados:', value, 'centavos');
    
    return cashOutRef.id;
  } catch (error) {
    console.error('❌ [cashOut] Erro ao criar solicitação de saque:', error);
    throw error;
  }
}

