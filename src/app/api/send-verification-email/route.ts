import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { admin } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { userId, email, name } = await request.json();

    if (!userId || !email || !name) {
      return NextResponse.json(
        { success: false, error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Gerar link de verificação do Firebase
    const verificationLink = await admin.generateEmailVerificationLink(email);

    // Configurar transporter Nodemailer com Gmail OAuth2
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });

    // Template do email
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Confirme seu cadastro - Show do Milênio</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a237e 0%, #283593 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28px;">🎯 Show do Milênio</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Confirme seu cadastro</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #1a237e; margin-top: 0;">Olá, ${name}!</h2>
            
            <p>Bem-vindo(a) ao <strong>Show do Milênio</strong>! 🎉</p>
            
            <p>Para ativar sua conta e começar a competir, clique no botão abaixo para confirmar seu email:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background: #0E1525; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                ✅ Confirmar Email
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Se o botão não funcionar, copie e cole este link no seu navegador:<br>
              <a href="${verificationLink}" style="color: #1a237e; word-break: break-all;">${verificationLink}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #1a237e;">
              <h3 style="color: #1a237e; margin-top: 0;">🎮 O que você pode fazer:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Jogar quizzes de futebol e novelas</li>
                <li>Competir no ranking de jogadores</li>
                <li>Ganhar créditos e moedas</li>
                <li>Desafiar outros participantes</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
              Este email foi enviado para ${email}. Se você não se cadastrou no Show do Milênio, ignore este email.
            </p>
          </div>
        </body>
      </html>
    `;

    // Enviar email
    await transporter.sendMail({
      from: `"Show do Milênio" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '🎯 Confirme seu cadastro - Show do Milênio',
      html: emailHTML,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Email de verificação enviado com sucesso!' 
    });

  } catch (error) {
    console.error('Erro ao enviar email de verificação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

