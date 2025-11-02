const { appendMessageToSheet } = require('../utils/googleSheetsClient');

// 監視対象のチャンネルID
const TARGET_CHANNEL_ID = '1434544970907521158';

/**
 * 特定チャンネルのメッセージをGoogle Sheetsに記録
 * @param {Message} message - Discordメッセージオブジェクト
 */
async function handleSheetsMessage(message) {
  // ボット自身のメッセージは無視
  if (message.author.bot) return;

  // 対象チャンネル以外は無視
  if (message.channel.id !== TARGET_CHANNEL_ID) return;

  try {
    const content = message.content || '(メッセージ内容なし)'; // メッセージ内容

    // Google Sheetsに追加
    await appendMessageToSheet(content);

    console.log(`✅ メッセージを記録しました - チャンネル: ${message.channel.name}`);
  } catch (error) {
    console.error('❌ メッセージの記録に失敗しました:', error);
  }
}

module.exports = { handleSheetsMessage };
