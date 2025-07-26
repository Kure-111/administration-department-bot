/**
 * スレッド管理関連のユーティリティ関数
 */

/**
 * プライベートスレッドを作成する関数
 * @param {Message} responseMessage - 対応通知メッセージ
 * @param {User} responder - 対応者
 * @param {string|null} callerUserId - 呼び出し者のユーザーID
 * @returns {Promise<ThreadChannel|null>} - 作成されたスレッド
 */
async function createPrivateThread(responseMessage, responder, callerUserId) {
    try {
        // プライベートスレッドを作成
        const thread = await responseMessage.startThread({
            name: `緊急対応 - ${responder.displayName || responder.username}`,
            type: 12, // GUILD_PRIVATE_THREAD
            reason: '緊急呼び出し対応用プライベートスレッド'
        });
        
        // 対応者をスレッドに追加
        await thread.members.add(responder.id);
        
        // 呼び出し者をスレッドに追加（異なるユーザーの場合のみ）
        if (callerUserId && callerUserId !== responder.id) {
            await thread.members.add(callerUserId);
        }
        
        // スレッド内に初期メッセージを送信
        const allowedUsers = [responder.id];
        if (callerUserId && callerUserId !== responder.id) {
            allowedUsers.push(callerUserId);
        }
        
        await thread.send({
            content: createThreadWelcomeMessage(responder, callerUserId),
            allowedMentions: { 
                users: allowedUsers
            }
        });
        
        console.log(`Private thread created: ${thread.name} (ID: ${thread.id})`);
        return thread;
        
    } catch (error) {
        console.error('Error creating private thread:', error);
        return null;
    }
}

/**
 * スレッドのウェルカムメッセージを作成する関数
 * @param {User} responder - 対応者
 * @param {string|null} callerUserId - 呼び出し者のユーザーID
 * @returns {string} - ウェルカムメッセージ
 */
function createThreadWelcomeMessage(responder, callerUserId) {
    let message = `🔒 **対応者専用スレッド** 🔒\n対応者: ${responder}`;
    
    if (callerUserId) {
        message += `\n呼び出し者: <@${callerUserId}>`;
    }
    
    message += `\n\nこちらで詳細な連絡を取り合ってください。`;
    
    return message;
}

module.exports = {
    createPrivateThread
};