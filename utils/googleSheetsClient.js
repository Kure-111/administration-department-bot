/**
 * スプレッドシートにメッセージを追加
 * Google Apps Script Web AppのURLにHTTP POSTリクエストを送信
 * @param {string} content - メッセージ内容
 */
async function appendMessageToSheet(content) {
  try {
    const webAppUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!webAppUrl) {
      throw new Error('GOOGLE_APPS_SCRIPT_URL が設定されていません');
    }

    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ スプレッドシートに追加しました:`, result);
    return result;
  } catch (error) {
    console.error('❌ スプレッドシートへの書き込みに失敗しました:', error);
    throw error;
  }
}

module.exports = {
  appendMessageToSheet,
};
