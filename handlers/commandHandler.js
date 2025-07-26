/**
 * スラッシュコマンド関連のイベントハンドラー
 */

/**
 * インタラクション（スラッシュコマンド）が実行された時の処理
 * @param {Interaction} interaction - インタラクションオブジェクト
 * @param {Client} client - Discordクライアント
 */
async function handleInteractionCreate(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Error executing command:', error);
        
        const errorMessage = {
            content: 'There was an error while executing this command!',
            ephemeral: true
        };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
}

module.exports = {
    handleInteractionCreate
};