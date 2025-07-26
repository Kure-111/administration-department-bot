const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Bot稼働状況確認'),
    async execute(interaction) {
        const sent = await interaction.reply({ 
            content: 'Pinging...', 
            fetchReply: true 
        });
        
        const ping = sent.createdTimestamp - interaction.createdTimestamp;
        const apiPing = Math.round(interaction.client.ws.ping);
        
        await interaction.editReply(`🏓 **Pong!**\n⏱️ レスポンス時間: ${ping}ms\n💓 API Ping: ${apiPing}ms\n✅ Bot稼働中`);
    },
};