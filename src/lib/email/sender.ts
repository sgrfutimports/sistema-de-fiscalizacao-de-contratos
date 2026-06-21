import { Resend } from 'resend'

// Usa a chave da variável de ambiente, ou null se não configurada (simulação)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = process.env.NEXT_PUBLIC_FROM_EMAIL || 'fiscalizacao@71bimtz.eb.mil.br'

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!resend) {
    console.log('----------------------------------------------------')
    console.log(`[SIMULAÇÃO DE EMAIL] Para: ${to}`)
    console.log(`[ASSUNTO] ${subject}`)
    console.log(`[HTML AQUI]`)
    console.log('----------------------------------------------------')
    return { success: true, simulated: true, id: 'simulated_id' }
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (data.error) {
      console.error('Erro Resend API:', data.error)
      return { success: false, error: data.error.message }
    }

    return { success: true, id: data.data?.id }
  } catch (error: any) {
    console.error('Erro genérico envio email:', error)
    return { success: false, error: error.message }
  }
}

export function gerarTemplateCobranca(nomeFiscal: string, contratoDesc: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #133215; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">SISTEMA DE FISCALIZAÇÃO</h2>
        <p style="margin: 5px 0 0 0; color: #eab308;">71º Batalhão de Infantaria Motorizado</p>
      </div>
      <div style="padding: 30px; background-color: #ffffff; color: #333333;">
        <h3 style="color: #111827; margin-top: 0;">Aviso de Pendência: Relatório de Fiscalização</h3>
        <p>Prezado(a) <strong>${nomeFiscal}</strong>,</p>
        <p>Consta em nosso sistema uma pendência ou atraso referente ao envio/análise do relatório do seguinte contrato sob sua fiscalização:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <strong>Contrato:</strong> ${contratoDesc}
        </div>
        
        <p>Solicitamos que acesse o Sistema de Fiscalização o mais breve possível para regularizar a situação e evitar apontamentos nas auditorias.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="background-color: #f59e0b; color: #111827; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Acessar Sistema</a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 0;">Esta é uma mensagem automática gerada pelo Sistema de Fiscalização de Contratos.</p>
        <p style="margin: 5px 0 0 0;">Não responda a este e-mail.</p>
      </div>
    </div>
  `
}
