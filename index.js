/**
 * Discord Bot メインファイル
 * 緊急呼び出し対応Bot
 */

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// ハンドラーをインポート
const { handleMessageCreate } = require('./handlers/messageHandler');
const { handleReactionAdd } = require('./handlers/reactionHandler');
const { handleInteractionCreate } = require('./handlers/commandHandler');
const { handleSheetsMessage } = require('./handlers/sheetsMessageHandler');

// Discordクライアントを初期化
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

// コマンドコレクションを初期化
client.commands = new Collection();

/**
 * コマンドファイルを動的に読み込む関数
 */
function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandItems = fs.readdirSync(commandsPath);

    for (const item of commandItems) {
        const itemPath = path.join(commandsPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            // サブフォルダ内のコマンドファイルを読み込む
            const commandFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                loadCommandFile(path.join(itemPath, file));
            }
        } else if (item.endsWith('.js')) {
            // commandsフォルダ直下のファイルを読み込む
            loadCommandFile(itemPath);
        }
    }
}

/**
 * 個別のコマンドファイルを読み込む関数
 * @param {string} filePath - コマンドファイルのパス
 */
function loadCommandFile(filePath) {
    try {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`Command loaded: ${command.data.name}`);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    } catch (error) {
        console.error(`Error loading command from ${filePath}:`, error);
    }
}

// コマンドを読み込み
loadCommands();

/**
 * Bot準備完了イベント
 */
client.once('ready', () => {
    console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
    console.log(`📊 Loaded ${client.commands.size} command(s)`);
    console.log(`🏠 Connected to ${client.guilds.cache.size} server(s)`);
});

/**
 * メッセージ作成イベント
 */
client.on('messageCreate', async (message) => {
    await handleMessageCreate(message, client);
    await handleSheetsMessage(message);
});

/**
 * リアクション追加イベント
 */
client.on('messageReactionAdd', async (reaction, user) => {
    await handleReactionAdd(reaction, user, client);
});

/**
 * インタラクション作成イベント（スラッシュコマンド）
 */
client.on('interactionCreate', async (interaction) => {
    await handleInteractionCreate(interaction, client);
});

/**
 * エラーハンドリング
 */
client.on('error', (error) => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// Botにログイン
client.login(process.env.DISCORD_TOKEN)
    .then(() => {
        console.log('🚀 Bot login successful');
    })
    .catch((error) => {
        console.error('❌ Bot login failed:', error);
        process.exit(1);
    });