/**
 * メッセージ関連のイベントハンドラー
 */

const { isEmergencyMessage } = require('../utils/messageDetector');

/**
 * 新しいメッセージが投稿された時の処理
 * @param {Message} message - Discordメッセージオブジェクト
 * @param {Client} client - Discordクライアント
 */
async function handleMessageCreate(message, client) {
    // Botのメッセージは無視
    if (message.author.bot && message.author.id === client.user.id) return;
    
    // 緊急呼び出しメッセージの場合、Botが🫡でリアクション
    if (isEmergencyMessage(message)) {
        try {
            await message.react('🫡');
            console.log(`Emergency message detected, bot reacted with 🫡 to message ${message.id}`);
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    }
}

module.exports = {
    handleMessageCreate
};