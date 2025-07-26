/**
 * 緊急呼び出しメッセージ解析ユーティリティ
 */

/**
 * 緊急呼び出しメッセージから詳細情報を抽出する関数
 * @param {Message} message - Discordメッセージオブジェクト
 * @returns {Object} - 抽出された情報
 */
function parseEmergencyMessage(message) {
    let callerName = null;
    let location = null;
    let contactType = 'anyone'; // デフォルト値

    // Embedメッセージから情報を抽出
    if (message.embeds.length > 0) {
        const embed = message.embeds[0];
        
        // フィールドから情報を抽出
        if (embed.fields && embed.fields.length > 0) {
            for (const field of embed.fields) {
                const fieldName = field.name.toLowerCase();
                const fieldValue = field.value.trim();
                
                // 呼び出し者
                if (fieldName.includes('呼び出し者') || fieldName.includes('👤')) {
                    callerName = fieldValue;
                }
                
                // 現在地/場所
                if (fieldName.includes('現在地') || fieldName.includes('場所') || fieldName.includes('📍')) {
                    location = fieldValue;
                }
                
                // 要請タイプ
                if (fieldName.includes('要請') || fieldName.includes('タイプ') || fieldName.includes('🎯')) {
                    const typeValue = fieldValue.toLowerCase();
                    if (typeValue.includes('理解している人') || typeValue.includes('経験者')) {
                        contactType = 'experienced';
                    } else if (typeValue.includes('スタッフ') || typeValue.includes('職員')) {
                        contactType = 'staff';
                    } else {
                        contactType = 'anyone';
                    }
                }
            }
        }
        
        // 説明文からも情報を抽出（フィールドで見つからない場合）
        if (embed.description) {
            if (!callerName) {
                const callerMatch = embed.description.match(/(?:呼び出し者|👤[^:]*[:：])\s*([^\n\r]+)/);
                if (callerMatch) callerName = callerMatch[1].trim();
            }
            
            if (!location) {
                const locationMatch = embed.description.match(/(?:現在地|場所|📍[^:]*[:：])\s*([^\n\r]+)/);
                if (locationMatch) location = locationMatch[1].trim();
            }
            
            const typeMatch = embed.description.match(/(?:要請|タイプ|🎯[^:]*[:：])\s*([^\n\r]+)/);
            if (typeMatch) {
                const typeValue = typeMatch[1].trim().toLowerCase();
                if (typeValue.includes('理解している人') || typeValue.includes('経験者')) {
                    contactType = 'experienced';
                } else if (typeValue.includes('スタッフ') || typeValue.includes('職員')) {
                    contactType = 'staff';
                } else {
                    contactType = 'anyone';
                }
            }
        }
    }
    
    // 通常のメッセージからも情報を抽出
    if (message.content) {
        if (!callerName) {
            const callerMatch = message.content.match(/(?:呼び出し者|👤[^:]*[:：])\s*([^\n\r]+)/);
            if (callerMatch) callerName = callerMatch[1].trim();
        }
        
        if (!location) {
            const locationMatch = message.content.match(/(?:現在地|場所|📍[^:]*[:：])\s*([^\n\r]+)/);
            if (locationMatch) location = locationMatch[1].trim();
        }
        
        const typeMatch = message.content.match(/(?:要請|タイプ|🎯[^:]*[:：])\s*([^\n\r]+)/);
        if (typeMatch) {
            const typeValue = typeMatch[1].trim().toLowerCase();
            if (typeValue.includes('理解している人') || typeValue.includes('経験者')) {
                contactType = 'experienced';
            } else if (typeValue.includes('スタッフ') || typeValue.includes('職員')) {
                contactType = 'staff';
            } else {
                contactType = 'anyone';
            }
        }
    }

    return {
        callerName,
        location,
        contactType
    };
}

module.exports = {
    parseEmergencyMessage
};