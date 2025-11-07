/**
 * Serviço de Envio de E-mails Transacionais
 * Integração com Brevo (SendinBlue)
 * 
 * TODO: Implementar integração completa com Brevo API
 * Documentação: https://developers.brevo.com/docs
 * 
 * Endpoints principais:
 * - POST /v3/smtp/email → Enviar e-mail transacional
 * - GET /v3/smtp/templates → Listar templates
 * - POST /v3/smtp/templates → Criar template
 */

const BREVO_API_URL = 'https://api.brevo.com/v3';

interface EmailConfig {
  apiKey: string;
}

/**
 * Obter configuração do Brevo das variáveis de ambiente
 */
function getEmailConfig(): EmailConfig {
  return {
    apiKey: process.env.BREVO_API_KEY || '',
  };
}

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

/**
 * Enviar e-mail genérico
 * 
 * TODO: Implementar chamada à API do Brevo
 */
export async function sendEmail({
  to,
  toName,
  subject,
  htmlContent,
  textContent,
}: SendEmailParams) {
  const config = getEmailConfig();

  if (!config.apiKey) {
    console.warn('BREVO_API_KEY não configurada. E-mail não será enviado.');
    return;
  }

  // TODO: Implementar chamada à API
  // const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
  //   method: 'POST',
  //   headers: {
  //     'accept': 'application/json',
  //     'api-key': config.apiKey,
  //     'content-type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     sender: {
  //       name: 'PósVendas Pro',
  //       email: 'noreply@posvendaspro.com',
  //     },
  //     to: [{ email: to, name: toName }],
  //     subject,
  //     htmlContent,
  //     textContent,
  //   }),
  // });

  console.log(`[EMAIL] Enviaria e-mail para ${to}: ${subject}`);
  // throw new Error('Integração com Brevo não implementada ainda');
}

/**
 * Enviar e-mail de boas-vindas para novo usuário
 * 
 * TODO: Criar template no Brevo e usar aqui
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  tempPassword?: string
) {
  const subject = 'Bem-vindo ao PósVendas Pro!';
  
  const htmlContent = `
    <h1>Olá, ${userName}!</h1>
    <p>Sua conta foi criada com sucesso no PósVendas Pro.</p>
    ${tempPassword ? `
      <p><strong>Sua senha temporária:</strong> ${tempPassword}</p>
      <p>Por favor, altere sua senha no primeiro acesso.</p>
    ` : ''}
    <p>Acesse o sistema em: <a href="${process.env.NEXTAUTH_URL}">${process.env.NEXTAUTH_URL}</a></p>
    <br>
    <p>Atenciosamente,<br>Equipe PósVendas Pro</p>
  `;

  await sendEmail({
    to: userEmail,
    toName: userName,
    subject,
    htmlContent,
    textContent: `Olá, ${userName}! Sua conta foi criada com sucesso no PósVendas Pro.`,
  });
}

/**
 * Enviar e-mail de recuperação de senha
 * 
 * TODO: Implementar fluxo de recuperação de senha
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  
  const subject = 'Recuperação de Senha - PósVendas Pro';
  
  const htmlContent = `
    <h1>Olá, ${userName}!</h1>
    <p>Você solicitou a recuperação de senha no PósVendas Pro.</p>
    <p>Clique no link abaixo para redefinir sua senha:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Este link expira em 1 hora.</p>
    <p>Se você não solicitou esta recuperação, ignore este e-mail.</p>
    <br>
    <p>Atenciosamente,<br>Equipe PósVendas Pro</p>
  `;

  await sendEmail({
    to: userEmail,
    toName: userName,
    subject,
    htmlContent,
    textContent: `Olá, ${userName}! Você solicitou recuperação de senha. Acesse: ${resetUrl}`,
  });
}

/**
 * Enviar notificação de nova reclamação
 * Notifica o cliente quando há uma nova reclamação no ML
 * 
 * TODO: Implementar após integração com ML
 */
export async function sendNewComplaintNotification(
  userEmail: string,
  userName: string,
  complaintDetails: {
    orderId: string;
    clientName: string;
    reason: string;
  }
) {
  const subject = `Nova Reclamação - Pedido ${complaintDetails.orderId}`;
  
  const htmlContent = `
    <h1>Olá, ${userName}!</h1>
    <p>Você tem uma nova reclamação no Mercado Livre:</p>
    <ul>
      <li><strong>Pedido:</strong> ${complaintDetails.orderId}</li>
      <li><strong>Cliente:</strong> ${complaintDetails.clientName}</li>
      <li><strong>Motivo:</strong> ${complaintDetails.reason}</li>
    </ul>
    <p>Acesse o sistema para responder: <a href="${process.env.NEXTAUTH_URL}/dashboard/reclamacoes">${process.env.NEXTAUTH_URL}/dashboard/reclamacoes</a></p>
    <br>
    <p>Atenciosamente,<br>Equipe PósVendas Pro</p>
  `;

  await sendEmail({
    to: userEmail,
    toName: userName,
    subject,
    htmlContent,
    textContent: `Nova reclamação no pedido ${complaintDetails.orderId} de ${complaintDetails.clientName}.`,
  });
}

/**
 * Enviar relatório semanal de reclamações
 * 
 * TODO: Implementar envio automático via cron job
 */
export async function sendWeeklyReport(
  userEmail: string,
  userName: string,
  stats: {
    totalComplaints: number;
    resolved: number;
    pending: number;
  }
) {
  const subject = 'Relatório Semanal - PósVendas Pro';
  
  const htmlContent = `
    <h1>Olá, ${userName}!</h1>
    <p>Aqui está o resumo de suas reclamações esta semana:</p>
    <ul>
      <li><strong>Total:</strong> ${stats.totalComplaints}</li>
      <li><strong>Resolvidas:</strong> ${stats.resolved}</li>
      <li><strong>Pendentes:</strong> ${stats.pending}</li>
    </ul>
    <p>Acesse o sistema para mais detalhes: <a href="${process.env.NEXTAUTH_URL}/dashboard">${process.env.NEXTAUTH_URL}/dashboard</a></p>
    <br>
    <p>Atenciosamente,<br>Equipe PósVendas Pro</p>
  `;

  await sendEmail({
    to: userEmail,
    toName: userName,
    subject,
    htmlContent,
  });
}

