/**
 * 統計追跡関連のユーティリティ関数
 */

// 今日の対応統計を保存するマップ
const dailyStats = new Map();

/**
 * 対応統計を記録する関数
 * @param {string} responderId - 対応者のユーザーID
 * @param {string} responderName - 対応者の表示名
 */
function recordResponse(responderId, responderName) {
    const today = new Date().toDateString();
    
    if (!dailyStats.has(today)) {
        dailyStats.set(today, new Map());
    }
    
    const todayStats = dailyStats.get(today);
    
    if (todayStats.has(responderId)) {
        todayStats.get(responderId).count++;
    } else {
        todayStats.set(responderId, {
            name: responderName,
            count: 1,
            firstResponse: new Date()
        });
    }
}

/**
 * 今日の統計を取得する関数
 * @returns {Object} 今日の統計データ
 */
function getTodayStats() {
    const today = new Date().toDateString();
    const todayStats = dailyStats.get(today) || new Map();
    
    let totalResponses = 0;
    const responders = [];
    
    for (const [userId, data] of todayStats) {
        totalResponses += data.count;
        responders.push({
            userId,
            name: data.name,
            count: data.count,
            firstResponse: data.firstResponse
        });
    }
    
    // 対応回数でソート
    responders.sort((a, b) => b.count - a.count);
    
    return {
        date: today,
        totalResponses,
        responders,
        totalResponders: responders.length
    };
}

/**
 * 統計をリセットする関数（デバッグ用）
 */
function resetStats() {
    dailyStats.clear();
}

module.exports = {
    recordResponse,
    getTodayStats,
    resetStats
};