# Administration Department Bot

Discord Botで緊急呼び出しを管理し、特定チャンネルのメッセージをGoogle Sheetsに自動記録するアプリケーション。

## 機能

1. **緊急呼び出し管理**
   - 緊急呼び出しメッセージを自動検出
   - 対応者の管理とトラッキング
   - プライベートスレッドの自動作成
   - Supabaseデータベースへの記録

2. **メッセージ記録（Google Sheets連携）**
   - 特定チャンネル（ID: `1434544970907521158`）のメッセージを自動記録
   - Google Sheetsのシート1、A列に記録

## セットアップ手順

### 1. 必要な環境

- Node.js（v16以上推奨）
- Discord Bot アカウント
- Supabaseアカウント（緊急呼び出し機能用）
- Googleアカウント（スプレッドシート連携用）

### 2. インストール

```bash
# 依存パッケージをインストール
npm install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成：

```bash
cp .env.example .env
```

`.env`ファイルを編集して、以下の情報を設定：

#### Discord設定
- `DISCORD_TOKEN`: Discord Developer Portalで取得したBot Token
- `CLIENT_ID`: Discord Developer PortalのApplication ID

#### Supabase設定
- `VITE_SUPABASE_URL`: SupabaseプロジェクトのURL
- `VITE_SUPABASE_ANON_KEY`: Supabaseの匿名キー

#### Google Sheets設定
- `GOOGLE_APPS_SCRIPT_URL`: Google Apps ScriptのWeb App URL

### 4. Google Apps Scriptの設定

1. **スプレッドシートを開く**
   - 記録先のGoogle Sheetsを開く

2. **Apps Scriptを開く**
   - メニューから「拡張機能」→「Apps Script」

3. **コードを貼り付け**
   - `google-apps-script/Code.gs`の内容をコピー＆ペースト

4. **デプロイ**
   - 「デプロイ」→「新しいデプロイ」
   - 「ウェブアプリ」を選択
   - 「アクセスできるユーザー」を「全員」に設定
   - デプロイ後、表示されるURLを`.env`の`GOOGLE_APPS_SCRIPT_URL`に設定

### 5. Discordコマンドの登録

```bash
node deploy-commands.js
```

### 6. Botの起動

```bash
npm start
```

## プロジェクト構造

```
administration-department-bot/
├── commands/              # Discordスラッシュコマンド
│   ├── hello.js
│   └── ping.js
├── handlers/             # イベントハンドラー
│   ├── commandHandler.js
│   ├── messageHandler.js
│   ├── reactionHandler.js
│   └── sheetsMessageHandler.js  # Google Sheets連携
├── utils/                # ユーティリティ
│   ├── emergencyDatabase.js
│   ├── emergencyParser.js
│   ├── googleSheetsClient.js    # Google Sheets API
│   ├── messageDetector.js
│   ├── supabaseClient.js
│   ├── threadManager.js
│   └── userIdExtractor.js
├── google-apps-script/   # Google Apps Scriptコード
│   └── Code.gs
├── index.js              # メインエントリーポイント
├── deploy-commands.js    # コマンド登録スクリプト
├── package.json
└── .env                  # 環境変数（Git管理外）
```

## 使い方

### スラッシュコマンド

- `/hello` - Bot挨拶
- `/ping` - Bot応答時間確認

### 緊急呼び出し機能

1. 「緊急呼び出し」というキーワードを含むメッセージが投稿されると自動検出
2. Botが🫡リアクションを追加
3. チームメンバーがリアクションすると対応者として登録
4. プライベートスレッドが自動作成され、呼び出し者と対応者が追加される

### Google Sheets記録

- チャンネルID `1434544970907521158` に投稿されたメッセージが自動的にスプレッドシートに記録されます
- 記録先：シート1のA列

## トラブルシューティング

### Botが起動しない
- `.env`ファイルが正しく設定されているか確認
- Discord Tokenが有効か確認

### Google Sheetsに記録されない
- `GOOGLE_APPS_SCRIPT_URL`が正しいか確認
- Apps Scriptのデプロイ設定で「アクセスできるユーザー」が「全員」になっているか確認
- スプレッドシートに「シート1」という名前のシートが存在するか確認

### 緊急呼び出しが動作しない
- Supabaseの設定が正しいか確認
- データベースに`emergency_calls`テーブルが存在するか確認

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 貢献

バグ報告や機能追加のプルリクエストを歓迎します。
