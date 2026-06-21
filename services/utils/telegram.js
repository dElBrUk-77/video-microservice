const axios = require('axios');

/**
 * Servicio de notificaciones vía Telegram
 * Envía alertas críticas al Superadmin sobre actividad en la plataforma.
 */
const sendTelegramNotification = async (message) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('Telegram not configured, skipping notification.');
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: `🚀 *SISTEMA VOD ALERT*\n\n${message}`,
      parse_mode: 'Markdown'
    });
    console.log('Telegram notification sent.');
  } catch (err) {
    console.error('Error sending Telegram notification:', err.message);
  }
};

module.exports = { sendTelegramNotification };
