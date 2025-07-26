/**
 * 緊急呼び出しデータベース操作ユーティリティ
 */

const supabase = require('./supabaseClient');

/**
 * 緊急呼び出しに対応者を記録する関数
 * @param {string} callerName - 呼び出し者の名前
 * @param {string} location - 場所
 * @param {string} contactType - 連絡種別
 * @param {string} responderId - 対応者のDiscord ID
 * @param {string} responderName - 対応者の表示名
 * @returns {Promise<Object|null>} - 作成されたレコードまたはnull
 */
async function recordEmergencyResponse(callerName, location, contactType, responderId, responderName) {
    try {
        const { data, error } = await supabase
            .from('emergency_calls')
            .insert([
                {
                    name: callerName || 'Unknown',
                    location: location || 'Unknown',
                    contact_type: contactType || 'anyone',
                    status: 'responded',
                    responded_by: `${responderName} (${responderId})`,
                    responded_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error recording emergency response:', error);
            return null;
        }

        console.log('Emergency response recorded:', data);
        return data;

    } catch (error) {
        console.error('Exception in recordEmergencyResponse:', error);
        return null;
    }
}

/**
 * 既存の緊急呼び出しを対応済みに更新する関数
 * @param {number} emergencyId - 緊急呼び出しのID
 * @param {string} responderId - 対応者のDiscord ID
 * @param {string} responderName - 対応者の表示名
 * @returns {Promise<Object|null>} - 更新されたレコードまたはnull
 */
async function updateEmergencyResponse(emergencyId, responderId, responderName) {
    try {
        const { data, error } = await supabase
            .from('emergency_calls')
            .update({
                status: 'responded',
                responded_by: `${responderName} (${responderId})`,
                responded_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', emergencyId)
            .eq('status', 'pending') // pending状態のもののみ更新
            .select()
            .single();

        if (error) {
            console.error('Error updating emergency response:', error);
            return null;
        }

        console.log('Emergency response updated:', data);
        return data;

    } catch (error) {
        console.error('Exception in updateEmergencyResponse:', error);
        return null;
    }
}

/**
 * 未対応の緊急呼び出しを取得する関数
 * @returns {Promise<Array>} - 未対応の緊急呼び出し一覧
 */
async function getPendingEmergencyCalls() {
    try {
        const { data, error } = await supabase
            .from('emergency_calls')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pending emergency calls:', error);
            return [];
        }

        return data || [];

    } catch (error) {
        console.error('Exception in getPendingEmergencyCalls:', error);
        return [];
    }
}

module.exports = {
    recordEmergencyResponse,
    updateEmergencyResponse,
    getPendingEmergencyCalls
};