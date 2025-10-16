import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';

const nodemailer = require('nodemailer');

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [API] Iniciando envio de verificação...');
    const { userId, email, name, phone } = await request.json();
    console.log('📧 [API] Dados recebidos:', { userId, email, name, phone });

    // Gerar link de verificação via Firebase Admin SDK
    console.log('🔗 [API] Gerando link de verificação...');
    let verificationLink = '';
    
    try {
      verificationLink = await admin.generateEmailVerificationLink(email);
      console.log('✅ [API] Link gerado com sucesso');
    } catch (linkError: any) {
      console.warn('⚠️ [API] Erro ao gerar link (rate limit):', linkError.message);
      console.log('ℹ️ [API] Continuando sem link personalizado...');
      verificationLink = 'Link não disponível (rate limit do Firebase)';
    }
    
    // Configurar transporter Nodemailer com SMTP Gmail
    console.log('📧 [API] Configurando Nodemailer...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'showdomileniooficial@gmail.com',
        pass: process.env.GMAIL_PASSWORD
      }
    });
    console.log('✅ [API] Nodemailer configurado');

    // Template HTML do email para o usuário
    const userHtmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verificação de Email - Show do Milênio</h2>
        <p>Olá ${name},</p>
        <p>Obrigado por se cadastrar no Show do Milênio! Para ativar sua conta, clique no link abaixo:</p>
        ${verificationLink.includes('http') ? 
          `<p><a href="${verificationLink}" style="color: #007bff; text-decoration: none; background-color: #f8f9fa; padding: 10px 20px; border-radius: 5px; display: inline-block;">Verificar Email</a></p>` :
          `<p style="color: #666;">Link não disponível no momento. Tente novamente mais tarde.</p>`
        }
        <p>Se você não se cadastrou em nosso site, pode ignorar este email.</p>
        <p style="font-size: 12px; color: #666;">Este link foi gerado automaticamente pelo Firebase.</p>
      </div>
    `;

    // Enviar email para o usuário
    console.log('📤 [API] Enviando email para o usuário...');
    await transporter.sendMail({
      from: 'showdomileniooficial@gmail.com',
      to: email,
      subject: 'Verificação de Email - Show do Milênio',
      html: userHtmlTemplate
    });
    console.log('✅ [API] Email enviado para o usuário');

    return NextResponse.json({ 
      success: true, 
      message: 'Email de verificação enviado com sucesso' 
    });

  } catch (error: any) {
    console.error('❌ [API] Erro ao enviar email de verificação:', error);
    console.error('❌ [API] Stack trace:', error.stack);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
