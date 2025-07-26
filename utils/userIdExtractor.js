/**
 * ユーザーID抽出関連のユーティリティ関数
 */

/**
 * 呼び出し者のユーザーIDを抽出する関数
 * @param {Message} message - Discordメッセージオブジェクト
 * @returns {string|null} - 抽出されたユーザーID
 */
function extractCallerUserId(message) {
    let callerUserId = null;
    
    // Embedメッセージから呼び出し者IDを抽出
    if (message.embeds.length > 0) {
        const embed = message.embeds[0];
        
        // フィールドからDiscord IDを探す（優先）
        if (embed.fields && embed.fields.length > 0) {
            const discordIdField = embed.fields.find(field => 
                field.name.includes('Discord ID') || field.name.toLowerCase().includes('discord id')
            );
            if (discordIdField) {
                const idValue = discordIdField.value.trim();
                callerUserId = extractIdFromValue(idValue);
                if (callerUserId) return callerUserId;
            }
            
            // Discord IDが見つからない場合、従来の呼び出し者フィールドを探す
            const callerField = embed.fields.find(field => 
                field.name.includes('呼び出し者') || field.name.includes('👤')
            );
            if (callerField) {
                const idValue = callerField.value.trim();
                callerUserId = extractIdFromValue(idValue);
                if (callerUserId) return callerUserId;
            }
        }
        
        // 説明文から呼び出し者IDを抽出（フィールドで見つからない場合）
        if (embed.description) {
            // Discord IDパターンを優先
            const discordIdMatch = embed.description.match(/(?:Discord ID|discord id)[^:]*[:：]\s*([^\n\r]+)/i);
            if (discordIdMatch) {
                const idValue = discordIdMatch[1].trim();
                callerUserId = extractIdFromValue(idValue);
                if (callerUserId) return callerUserId;
            }
            
            // 従来の呼び出し者パターンで検索
            const callerMatch = embed.description.match(/(?:呼び出し者|👤[^:]*[:：])\s*([^\n\r]+)/);
            if (callerMatch) {
                const idValue = callerMatch[1].trim();
                callerUserId = extractIdFromValue(idValue);
                if (callerUserId) return callerUserId;
            }
        }
    }
    
    // 通常のメッセージから呼び出し者IDを抽出
    if (message.content) {
        // Discord IDパターンを優先
        const discordIdMatch = message.content.match(/(?:Discord ID|discord id)[^:]*[:：]\s*([^\n\r]+)/i);
        if (discordIdMatch) {
            const idValue = discordIdMatch[1].trim();
            callerUserId = extractIdFromValue(idValue);
            if (callerUserId) return callerUserId;
        }
        
        // 従来の呼び出し者パターンで検索
        const callerMatch = message.content.match(/(?:呼び出し者|👤[^:]*[:：])\s*([^\n\r]+)/);
        if (callerMatch) {
            const idValue = callerMatch[1].trim();
            callerUserId = extractIdFromValue(idValue);
            if (callerUserId) return callerUserId;
        }
    }
    
    return null;
}

/**
 * 文字列からユーザーIDを抽出するヘルパー関数
 * @param {string} value - 抽出対象の文字列
 * @returns {string|null} - 抽出されたユーザーID
 */
function extractIdFromValue(value) {
    // 数字のみの場合はユーザーID
    if (/^\d+$/.test(value)) {
        return value;
    }
    
    // メンション形式の場合はIDを抽出
    if (value.includes('<@')) {
        const idMatch = value.match(/<@!?(\d+)>/);
        if (idMatch) {
            return idMatch[1];
        }
    }
    
    return null;
}

module.exports = {
    extractCallerUserId
};