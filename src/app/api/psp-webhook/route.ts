import { NextRequest, NextResponse } from "next/server";
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  // Log dos cabeçalhos
  console.log("[PSP Webhook] Headers:", Object.fromEntries(request.headers.entries()));

  // Log do corpo (application/x-www-form-urlencoded)
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  console.log("[PSP Webhook] Body:", body);

  // usar o id para achar o payment certo
  const pspId = (body.id as string).toLowerCase();
  const paymentSnapshot = await adminDb.collection('payments').where('pspId', '==', pspId).get();
  
  if (paymentSnapshot.empty) {
    console.error("[PSP Webhook] Payment não encontrado.");
    return NextResponse.json({ message: "Payment not found" }, { status: 404 });
  }
  
  const paymentId = paymentSnapshot.docs[0].id;
  const paymentData = paymentSnapshot.docs[0].data();
  const chatId = paymentData.chatId;
  
  if (!chatId) {
    console.error("[PSP Webhook] chatId não encontrado no payment");
    return NextResponse.json({ message: "chatId not found" }, { status: 400 });
  }

  // com o chatId do usuário, encontrar o usuário
  const userSnapshot = await adminDb.collection('users').where('chatId', '==', chatId).get();
  
  if (userSnapshot.empty) {
    console.error("[PSP Webhook] Usuário não encontrado com chatId:", chatId);
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  
  const userId = userSnapshot.docs[0].id;

  // Executar todas as operações em uma transação
  try {
    await adminDb.runTransaction(async (transaction) => {
      // Busca do documento payment
      const paymentRef = adminDb.collection('payments').doc(paymentId);
      const paymentDoc = await transaction.get(paymentRef);
      
      if (!paymentDoc.exists) {
        throw new Error("Payment not found");
      }
      
      const paymentData = paymentDoc.data()!;
      //////////////////////////////////////////////////

      // Busca do documento user
      const userRef = adminDb.collection('users').doc(userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error("User not found");
      }
      
      const userData = userDoc.data()!;
      //////////////////////////////////////////////////

      // Validação de status (pending/paid)
      if (paymentData.status == 'paid') {
        throw new Error("Payment is already paid");
      }

      // Validação de valor do pagamento
      const value = parseFloat(body.value as string);
      const totalAmount = paymentData.totalAmount;
      
      if (value !== totalAmount) {
        throw new Error("Value mismatch");
      }

      // Validação de CPF/CNPJ
      const payerNationalRegistration = body.payer_national_registration as string;
      const userCpf = userData.cpfNumber || '';
      const userCnpj = userData.cnpjNumber || '';
      
      if (payerNationalRegistration !== userCpf && payerNationalRegistration !== userCnpj) {
        throw new Error("CPF/CNPJ mismatch");
      }

      // Atualização do status do payment para 'paid'
      transaction.update(paymentRef, {
        status: 'paid',
        updatedAt: new Date(),
      });

      // Atualização dos totalCredits do user
      const creditsToReceive = paymentData.creditsToReceive;
      const currentCredits = userData.totalCredits || 0;
      const newTotalCredits = currentCredits + creditsToReceive;
      
      transaction.update(userRef, {
        totalCredits: newTotalCredits,
        updatedAt: new Date(),
      });
    });
  } catch (error: any) {
    console.error("[PSP Webhook] Erro na transação:", error.message);
    
    if (error.message === "Payment not found" || error.message === "User not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    
    if (error.message === "Payment is already paid") {
      return NextResponse.json({ message: "Payment was already done." }, { status: 200 });
    }
    
    if (error.message === "Value mismatch") {
      return NextResponse.json({ message: "Value mismatch" }, { status: 400 });
    }
    
    if (error.message === "CPF/CNPJ mismatch") {
      return NextResponse.json({ message: "CPF/CNPJ mismatch" }, { status: 400 });
    }
    
    return NextResponse.json({ message: "Transaction failed" }, { status: 500 });
  }
  

  return NextResponse.json({ message: "OK" }, { status: 200 });
}

