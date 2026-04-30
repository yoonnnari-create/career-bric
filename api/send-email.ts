import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 설정 (로컬 환경에서 테스트할 때 필요)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { subject, text, html, userEmail, userName } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // 1. 관리자에게 보내는 알림 이메일
    const adminMailOptions = {
      from: `"CareerBrick Admin" <${process.env.GMAIL_USER}>`,
      to: 'yoonnnari@gmail.com', // 관리자 이메일
      subject: subject || '[SAI] 새로운 워크북 답변이 도착했습니다',
      text: text,
      html: html,
    };

    const adminInfo = await transporter.sendMail(adminMailOptions);
    
    // 2. 사용자에게 보내는 감사 이메일 (userEmail이 있는 경우만)
    let userInfo = null;
    if (userEmail) {
      const userMailOptions = {
        from: `"CareerBrick Team" <${process.env.GMAIL_USER}>`,
        to: userEmail,
        subject: `[CareerBrick] ${userName || '고객'}님의 답변이 성공적으로 기록되었습니다.`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #ffffff; color: #333; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #a855f7; margin: 0; font-size: 28px;">CareerBrick</h1>
            </div>
            <h2 style="color: #111; font-size: 22px; margin-bottom: 20px;">답변이 성공적으로 기록되었습니다! 🎉</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 20px;">
              안녕하세요, <strong>${userName || '고객'}</strong>님.<br/>
              작성해주신 소중한 커리어 워크북 답변이 안전하게 서버에 저장되었습니다.
            </p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #a855f7;">
              <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.5;">
                보내주신 답변을 꼼꼼히 분석하여 조만간 구체적이고 전문적인 피드백을 드릴 예정입니다.<br/>
                조금만 기다려 주시면 감사하겠습니다.
              </p>
            </div>
            <p style="font-size: 15px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              본 메일은 발신 전용입니다. 문의사항이 있으시면 고객센터로 연락해주세요.<br/>
              © 2026 CareerBrick Team.
            </p>
          </div>
        `,
      };
      userInfo = await transporter.sendMail(userMailOptions);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Emails sent successfully', 
      adminInfoId: adminInfo.messageId,
      userInfoId: userInfo ? userInfo.messageId : null
    });
  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send emails', error: error.message });
  }
}
