import nodemailer from 'nodemailer';

// SMTP Configuration
const smtpConfig = {
  host: process.env.SMTP_HOST || 'mail.sky-r.com',
  port: parseInt(process.env.SMTP_PORT || '26'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'order@sky-r.com',
    pass: process.env.SMTP_PASS || 'S=AnzT=74-!W',
  },
};

// Create transporter
const transporter = nodemailer.createTransport(smtpConfig);

// Email templates
export const emailTemplates = {
  registrationConfirmation: (userName: string, activationLink: string, locale: string) => ({
    subject: locale === 'bg' ? 'Потвърждение на регистрация - Sky-R B2B' : 'Registration Confirmation - Sky-R B2B',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #E82525 0%, #ff6b6b 100%); padding: 20px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Sky-R B2B Platform</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">
            ${locale === 'bg' ? 'Добре дошли в Sky-R B2B!' : 'Welcome to Sky-R B2B!'}
          </h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            ${locale === 'bg' 
              ? `Здравейте ${userName},<br><br>Благодарим ви за регистрацията в Sky-R B2B платформата. Вашият акаунт е създаден успешно.`
              : `Hello ${userName},<br><br>Thank you for registering with Sky-R B2B platform. Your account has been created successfully.`
            }
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${activationLink}" 
               style="background: #E82525; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              ${locale === 'bg' ? 'Активирайте акаунта' : 'Activate Account'}
            </a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            ${locale === 'bg' 
              ? 'Ако имате въпроси, не се колебайте да се свържете с нас.'
              : 'If you have any questions, please don\'t hesitate to contact us.'
            }
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© 2024 Sky-R B2B Platform. ${locale === 'bg' ? 'Всички права запазени.' : 'All rights reserved.'}</p>
        </div>
      </div>
    `,
    text: locale === 'bg' 
      ? `Добре дошли в Sky-R B2B!\n\nЗдравейте ${userName},\n\nБлагодарим ви за регистрацията в Sky-R B2B платформата. Вашият акаунт е създаден успешно.\n\nАктивирайте акаунта: ${activationLink}\n\nАко имате въпроси, не се колебайте да се свържете с нас.\n\n© 2024 Sky-R B2B Platform. Всички права запазени.`
      : `Welcome to Sky-R B2B!\n\nHello ${userName},\n\nThank you for registering with Sky-R B2B platform. Your account has been created successfully.\n\nActivate Account: ${activationLink}\n\nIf you have any questions, please don't hesitate to contact us.\n\n© 2024 Sky-R B2B Platform. All rights reserved.`
  }),

  passwordReset: (userName: string, resetLink: string, locale: string) => ({
    subject: locale === 'bg' ? 'Възстановяване на парола - Sky-R B2B' : 'Password Reset - Sky-R B2B',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #E82525 0%, #ff6b6b 100%); padding: 20px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Sky-R B2B Platform</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">
            ${locale === 'bg' ? 'Възстановяване на парола' : 'Password Reset'}
          </h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            ${locale === 'bg' 
              ? `Здравейте ${userName},<br><br>Получихме заявка за възстановяване на паролата за вашия акаунт в Sky-R B2B платформата.`
              : `Hello ${userName},<br><br>We received a request to reset the password for your Sky-R B2B platform account.`
            }
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #E82525; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              ${locale === 'bg' ? 'Възстанови паролата' : 'Reset Password'}
            </a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            ${locale === 'bg' 
              ? 'Ако не сте вие направили тази заявка, можете да игнорирате този имейл.'
              : 'If you did not make this request, you can safely ignore this email.'
            }
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© 2024 Sky-R B2B Platform. ${locale === 'bg' ? 'Всички права запазени.' : 'All rights reserved.'}</p>
        </div>
      </div>
    `,
    text: locale === 'bg' 
      ? `Възстановяване на парола\n\nЗдравейте ${userName},\n\nПолучихме заявка за възстановяване на паролата за вашия акаунт в Sky-R B2B платформата.\n\nВъзстанови паролата: ${resetLink}\n\nАко не сте вие направили тази заявка, можете да игнорирате този имейл.\n\n© 2024 Sky-R B2B Platform. Всички права запазени.`
      : `Password Reset\n\nHello ${userName},\n\nWe received a request to reset the password for your Sky-R B2B platform account.\n\nReset Password: ${resetLink}\n\nIf you did not make this request, you can safely ignore this email.\n\n© 2024 Sky-R B2B Platform. All rights reserved.`
  }),

  agencyApproval: (userName: string, companyName: string, locale: string) => ({
    subject: locale === 'bg' ? 'Одобрение на агенция - Sky-R B2B' : 'Agency Approval - Sky-R B2B',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #E82525 0%, #ff6b6b 100%); padding: 20px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Sky-R B2B Platform</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">
            ${locale === 'bg' ? 'Вашата агенция е одобрена!' : 'Your Agency is Approved!'}
          </h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            ${locale === 'bg' 
              ? `Здравейте ${userName},<br><br>Радваме се да ви уведомим, че вашата агенция "${companyName}" е одобрена за достъп до Sky-R B2B платформата.`
              : `Hello ${userName},<br><br>We are pleased to inform you that your agency "${companyName}" has been approved for access to the Sky-R B2B platform.`
            }
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}" 
               style="background: #E82525; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              ${locale === 'bg' ? 'Влез в платформата' : 'Access Platform'}
            </a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            ${locale === 'bg' 
              ? 'Вече можете да влезете в акаунта си и да започнете да използвате всички функции на платформата.'
              : 'You can now log in to your account and start using all platform features.'
            }
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© 2024 Sky-R B2B Platform. ${locale === 'bg' ? 'Всички права запазени.' : 'All rights reserved.'}</p>
        </div>
      </div>
    `,
    text: locale === 'bg' 
      ? `Вашата агенция е одобрена!\n\nЗдравейте ${userName},\n\nРадваме се да ви уведомим, че вашата агенция "${companyName}" е одобрена за достъп до Sky-R B2B платформата.\n\nВлез в платформата: ${process.env.FRONTEND_URL || 'http://localhost:3001'}\n\nВече можете да влезете в акаунта си и да започнете да използвате всички функции на платформата.\n\n© 2024 Sky-R B2B Platform. Всички права запазени.`
      : `Your Agency is Approved!\n\nHello ${userName},\n\nWe are pleased to inform you that your agency "${companyName}" has been approved for access to the Sky-R B2B platform.\n\nAccess Platform: ${process.env.FRONTEND_URL || 'http://localhost:3001'}\n\nYou can now log in to your account and start using all platform features.\n\n© 2024 Sky-R B2B Platform. All rights reserved.`
  })
};

// Email sending functions
export const sendEmail = async (to: string, template: any, locale: string = 'bg') => {
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Sky-R B2B Platform'}" <${process.env.SMTP_FROM || 'order@sky-r.com'}>`,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Specific email functions
export const sendRegistrationEmail = async (email: string, userName: string, activationToken: string, locale: string = 'bg') => {
  const activationLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/${locale}/activate?token=${activationToken}`;
  const template = emailTemplates.registrationConfirmation(userName, activationLink, locale);
  return await sendEmail(email, template, locale);
};

export const sendPasswordResetEmail = async (email: string, userName: string, resetToken: string, locale: string = 'bg') => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/${locale}/reset-password?token=${resetToken}`;
  const template = emailTemplates.passwordReset(userName, resetLink, locale);
  return await sendEmail(email, template, locale);
};

export const sendAgencyApprovalEmail = async (email: string, userName: string, companyName: string, locale: string = 'bg') => {
  const template = emailTemplates.agencyApproval(userName, companyName, locale);
  return await sendEmail(email, template, locale);
}; 