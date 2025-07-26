/**
 * リアクション関連のイベントハンドラー
 */

const { isEmergencyMessage } = require('../utils/messageDetector');
const { extractCallerUserId } = require('../utils/userIdExtractor');
const { createPrivateThread } = require('../utils/threadManager');
const { recordEmergencyResponse } = require('../utils/emergencyDatabase');
const { parseEmergencyMessage } = require('../utils/emergencyParser');

/**
 * リアクション追跡用のマップ
 * key: messageId_emojiName, value: { userId, username, timestamp }
 */
const emergencyMessages = new Map();

/**
 * リアクションが追加された時の処理
 * @param {MessageReaction} reaction - リアクションオブジェクト
 * @param {User} user - リアクションしたユーザー
 * @param {Client} client - Discordクライアント
 */
async function handleReactionAdd(reaction, user, client) {
    // Botのリアクションは無視
    if (user.bot) return;

    // パーシャルの場合は完全なデータを取得
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            return;
        }
    }

    const message = reaction.message;
    
    // 緊急呼び出しメッセージかどうかを確認
    if (!isEmergencyMessage(message)) return;
    
    const messageId = message.id;
    const emojiName = reaction.emoji.name;
    
    // Botが同じリアクションをしているかチェック
    const botReaction = message.reactions.cache.find(r => 
        r.emoji.name === emojiName && r.users.cache.has(client.user.id)
    );
    
    // Botがリアクションしていない場合は処理しない
    if (!botReaction) return;
    
    // このメッセージとリアクションの組み合わせで初回ユーザーかチェック
    const key = `${messageId}_${emojiName}`;
    
    if (!emergencyMessages.has(key)) {
        // 初回リアクション！
        emergencyMessages.set(key, {
            userId: user.id,
            username: user.displayName || user.username,
            timestamp: new Date()
        });
        
        // 対応処理を実行
        await handleEmergencyResponse(message, user, client);
    }
}

/**
 * 緊急呼び出しへの対応処理
 * @param {Message} message - 緊急呼び出しメッセージ
 * @param {User} responder - 対応者
 * @param {Client} client - Discordクライアント
 */
async function handleEmergencyResponse(message, responder, client) {
    // 呼び出し者のユーザーIDを抽出
    const callerUserId = extractCallerUserId(message);
    
    // 緊急呼び出しメッセージから詳細情報を抽出
    const emergencyInfo = parseEmergencyMessage(message);
    
    try {
        // Supabaseに対応記録を保存
        const dbRecord = await recordEmergencyResponse(
            emergencyInfo.callerName,
            emergencyInfo.location,
            emergencyInfo.contactType,
            responder.id,
            responder.displayName || responder.username
        );
        
        if (dbRecord) {
            console.log(`Emergency response recorded in database: ID ${dbRecord.id}`);
        } else {
            console.warn('Failed to record emergency response in database');
        }
        
        // 対応通知メッセージを作成・送信
        const responseMessage = createResponseMessage(responder, callerUserId);
        const allowedUsers = getAllowedUsers(responder.id, callerUserId);
        
        const responseMsg = await message.channel.send({
            content: responseMessage,
            allowedMentions: { 
                users: allowedUsers
            }
        });
        
        // プライベートスレッドを作成
        await createPrivateThread(responseMsg, responder, callerUserId);
        
    } catch (error) {
        console.error('Error handling emergency response:', error);
    }
}

/**
 * 対応通知メッセージを作成する関数
 * @param {User} responder - 対応者
 * @param {string|null} callerUserId - 呼び出し者のユーザーID
 * @returns {string} - 対応通知メッセージ
 */
function createResponseMessage(responder, callerUserId) {
    let message = `🚨 **緊急呼び出し対応** 🚨\n${responder} が対応します！`;
    
    if (callerUserId) {
        message += `\n\n<@${callerUserId}> 対応者が決まりました！`;
    }
    
    return message;
}

/**
 * メンション許可ユーザーリストを取得する関数
 * @param {string} responderId - 対応者のユーザーID
 * @param {string|null} callerUserId - 呼び出し者のユーザーID
 * @returns {string[]} - 許可ユーザーIDの配列
 */
function getAllowedUsers(responderId, callerUserId) {
    const allowedUsers = [responderId];
    
    // 呼び出し者をメンション（重複チェック）
    if (callerUserId && !allowedUsers.includes(callerUserId)) {
        allowedUsers.push(callerUserId);
    }
    
    return allowedUsers;
}

module.exports = {
    handleReactionAdd
};