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

  const { subject, text, html } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"CareerBrick Admin" <${process.env.GMAIL_USER}>`,
      to: 'yoonnnari@gmail.com', // 알림을 받을 본인 이메일
      subject: subject || '[SAI] 새로운 워크북 답변이 도착했습니다',
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email sent successfully', infoId: info.messageId });
  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
}
