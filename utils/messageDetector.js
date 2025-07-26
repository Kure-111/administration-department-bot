/**
 * メッセージ検出関連のユーティリティ関数
 */

/**
 * 緊急呼び出しメッセージかどうかを判定する関数
 * @param {Message} message - Discordメッセージオブジェクト
 * @returns {boolean} - 緊急呼び出しメッセージの場合true
 */
function isEmergencyMessage(message) {
    // Embedメッセージの場合
    if (message.embeds.length > 0) {
        const embed = message.embeds[0];
        if ((embed.title && embed.title.includes('緊急呼び出し')) ||
            (embed.description && embed.description.includes('緊急呼び出し'))) {
            return true;
        }
    }
    
    // 通常のメッセージの場合
    if (message.content && message.content.includes('緊急呼び出し')) {
        return true;
    }
    
    return false;
}

module.exports = {
    isEmergencyMessage
};