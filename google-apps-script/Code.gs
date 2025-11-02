/**
 * Google Apps Script - Discord Bot用のWebhook
 * このスクリプトをスプレッドシートに設定してWeb Appとしてデプロイしてください
 */

/**
 * 設定値
 * 実際のスプレッドシートIDとシート名に置き換えてください。
 * 例: https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit の <SPREADSHEET_ID> 部分
 */
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAME = 'シート1';

/**
 * POSTリクエストを処理する関数
 * @param {Object} e - イベントオブジェクト
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('リクエストボディが空です');
    }

    // リクエストボディを解析
    const data = JSON.parse(e.postData.contents);
    const content = data.content ?? '(メッセージ内容なし)';

    if (!SPREADSHEET_ID || SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID') {
      throw new Error('SPREADSHEET_ID が設定されていません');
    }

    // スプレッドシートを取得
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error(`シート "${SHEET_NAME}" が見つかりません`);
    }

    // A列で上から最初に空いている行を特定
    const lastRow = sheet.getLastRow();
    let targetRow = 1;

    if (lastRow > 0) {
      const columnValues = sheet.getRange(1, 1, lastRow, 1).getValues();
      const emptyIndex = columnValues.findIndex((row) => !row[0]);
      targetRow = emptyIndex === -1 ? lastRow + 1 : emptyIndex + 1;
    }

    // ログ出力（Apps Scriptの実行ログで確認可能）
    const logPayload = {
      action: 'append',
      sheetName: SHEET_NAME,
      targetRow,
      content
    };

    // ログ出力（Apps Scriptダッシュボードおよびログエクスプローラに記録）
    console.log(JSON.stringify(logPayload));
    Logger.log(JSON.stringify(logPayload));

    // メッセージ内容のみをA列に設定
    sheet.getRange(targetRow, 1).setValue(content);

    // 成功レスポンスを返す
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'データを追加しました',
      content: content
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // エラーレスポンスを返す
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GETリクエストを処理する関数（テスト用）
 * @param {Object} e - イベントオブジェクト
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Google Apps Script Webhook is running'
  })).setMimeType(ContentService.MimeType.JSON);
}
