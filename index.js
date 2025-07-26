const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

client.commands = new Collection();

// 緊急呼び出しメッセージの追跡用
const emergencyMessages = new Map();
const foldersPath = path.join(__dirname, 'commands');
const commandItems = fs.readdirSync(foldersPath);

for (const item of commandItems) {
    const itemPath = path.join(foldersPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
        // サブフォルダ内のコマンドファイルを読み込む
        const commandFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(itemPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    } else if (item.endsWith('.js')) {
        // commandsフォルダ直下のファイルを読み込む
        const command = require(itemPath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${itemPath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.once('ready', () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
});

// 新しいメッセージが投稿された時の処理
client.on('messageCreate', async (message) => {
    // Botのメッセージは無視
    if (message.author.bot && message.author.id === client.user.id) return;
    
    // 緊急呼び出しメッセージかどうかを確認
    let isEmergencyMessage = false;
    
    // Embedメッセージの場合
    if (message.embeds.length > 0) {
        const embed = message.embeds[0];
        if ((embed.title && embed.title.includes('緊急呼び出し')) ||
            (embed.description && embed.description.includes('緊急呼び出し'))) {
            isEmergencyMessage = true;
        }
    }
    
    // 通常のメッセージの場合
    if (message.content && message.content.includes('緊急呼び出し')) {
        isEmergencyMessage = true;
    }
    
    // 緊急呼び出しメッセージの場合、Botが🫡でリアクション
    if (isEmergencyMessage) {
        try {
            await message.react('🫡');
            console.log(`Emergency message detected, bot reacted with 🫡 to message ${message.id}`);
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// 呼び出し者のユーザーIDを抽出する関数
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
                // 数字のみの場合はユーザーID、メンション形式の場合はIDを抽出
                if (/^\d+$/.test(idValue)) {
                    callerUserId = idValue;
                } else if (idValue.includes('<@')) {
                    const idMatch = idValue.match(/<@!?(\d+)>/);
                    if (idMatch) {
                        callerUserId = idMatch[1];
                    }
                }
            }
            
            // Discord IDが見つからない場合、従来の呼び出し者フィールドを探す
            if (!callerUserId) {
                const callerField = embed.fields.find(field => 
                    field.name.includes('呼び出し者') || field.name.includes('👤')
                );
                if (callerField) {
                    const idValue = callerField.value.trim();
                    // 数字のみの場合はユーザーID、メンション形式の場合はIDを抽出
                    if (/^\d+$/.test(idValue)) {
                        callerUserId = idValue;
                    } else if (idValue.includes('<@')) {
                        const idMatch = idValue.match(/<@!?(\d+)>/);
                        if (idMatch) {
                            callerUserId = idMatch[1];
                        }
                    }
                }
            }
        }
        
        // 説明文から呼び出し者IDを抽出（フィールドで見つからない場合）
        if (!callerUserId && embed.description) {
            // Discord IDパターンを優先
            const discordIdMatch = embed.description.match(/(?:Discord ID|discord id)[^:]*[:：]\s*([^\n\r]+)/i);
            if (discordIdMatch) {
                const idValue = discordIdMatch[1].trim();
                if (/^\d+$/.test(idValue)) {
                    callerUserId = idValue;
                } else if (idValue.includes('<@')) {
                    const idMatch = idValue.match(/<@!?(\d+)>/);
                    if (idMatch) {
                        callerUserId = idMatch[1];
                    }
                }
            }
            
            // 従来の呼び出し者パターンで検索
            if (!callerUserId) {
                const callerMatch = embed.description.match(/(?:呼び出し者|👤[^:]*[:：])\s*([^\n\r]+)/);
                if (callerMatch) {
                    const idValue = callerMatch[1].trim();
                    if (/^\d+$/.test(idValue)) {
                        callerUserId = idValue;
                    } else if (idValue.includes('<@')) {
                        const idMatch = idValue.match(/<@!?(\d+)>/);
                        if (idMatch) {
                            callerUserId = idMatch[1];
                        }
                    }
                }
            }
        }
    }
    
    // 通常のメッセージから呼び出し者IDを抽出
    if (!callerUserId && message.content) {
        // Discord IDパターンを優先
        const discordIdMatch = message.content.match(/(?:Discord ID|discord id)[^:]*[:：]\s*([^\n\r]+)/i);
        if (discordIdMatch) {
            const idValue = discordIdMatch[1].trim();
            if (/^\d+$/.test(idValue)) {
                callerUserId = idValue;
            } else if (idValue.includes('<@')) {
                const idMatch = idValue.match(/<@!?(\d+)>/);
                if (idMatch) {
                    callerUserId = idMatch[1];
                }
            }
        }
        
        // 従来の呼び出し者パターンで検索
        if (!callerUserId) {
            const callerMatch = message.content.match(/(?:呼び出し者|👤[^:]*[:：])\s*([^\n\r]+)/);
            if (callerMatch) {
                const idValue = callerMatch[1].trim();
                if (/^\d+$/.test(idValue)) {
                    callerUserId = idValue;
                } else if (idValue.includes('<@')) {
                    const idMatch = idValue.match(/<@!?(\d+)>/);
                    if (idMatch) {
                        callerUserId = idMatch[1];
                    }
                }
            }
        }
    }
    
    return callerUserId;
}

// リアクション追跡イベント
client.on('messageReactionAdd', async (reaction, user) => {
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
    
    // 緊急呼び出しメッセージかどうかを確認（メッセージ内容で判定）
    let isEmergencyMessage = false;
    
    // Embedメッセージの場合
    if (message.embeds.length > 0) {
        const embed = message.embeds[0];
        if ((embed.title && embed.title.includes('緊急呼び出し')) ||
            (embed.description && embed.description.includes('緊急呼び出し'))) {
            isEmergencyMessage = true;
        }
    }
    
    // 通常のメッセージの場合
    if (message.content && message.content.includes('緊急呼び出し')) {
        isEmergencyMessage = true;
    }
    
    if (isEmergencyMessage) {
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
            
            // 呼び出し者のユーザーIDを抽出
            const callerUserId = extractCallerUserId(message);
            
            // チャンネルに通知メッセージを送信
            try {
                let responseMessage = `🚨 **緊急呼び出し対応** 🚨\n${user} が対応します！`;
                
                // メンション許可対象のユーザーIDリスト（重複除去）
                let allowedUsers = [user.id];
                
                if (callerUserId) {
                    // 呼び出し者をメンション（重複チェック）
                    if (!allowedUsers.includes(callerUserId)) {
                        allowedUsers.push(callerUserId);
                    }
                    responseMessage += `\n\n<@${callerUserId}> 対応者が決まりました！`;
                }
                
                // 対応通知メッセージを送信
                const responseMsg = await message.channel.send({
                    content: responseMessage,
                    allowedMentions: { 
                        users: allowedUsers
                    }
                });
                
                // プライベートスレッドを作成
                try {
                    const thread = await responseMsg.startThread({
                        name: `緊急対応 - ${user.displayName || user.username}`,
                        type: 12, // GUILD_PRIVATE_THREAD
                        reason: '緊急呼び出し対応用プライベートスレッド'
                    });
                    
                    // 対応者をスレッドに追加
                    await thread.members.add(user.id);
                    
                    // 呼び出し者をスレッドに追加（異なるユーザーの場合のみ）
                    if (callerUserId && callerUserId !== user.id) {
                        await thread.members.add(callerUserId);
                    }
                    
                    // スレッド内に初期メッセージを送信
                    await thread.send({
                        content: `🔒 **対応者専用スレッド** 🔒\n対応者: ${user}\n${callerUserId ? `呼び出し者: <@${callerUserId}>` : ''}\n\nこちらで詳細な連絡を取り合ってください。`,
                        allowedMentions: { 
                            users: allowedUsers
                        }
                    });
                    
                    console.log(`Private thread created: ${thread.name} (ID: ${thread.id})`);
                } catch (threadError) {
                    console.error('Error creating private thread:', threadError);
                    // スレッド作成に失敗してもメイン機能は継続
                }
                
            } catch (error) {
                console.error('Error sending response message:', error);
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);