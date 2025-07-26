const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getTodayStats } = require('../utils/statsTracker');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('今日の対応統計を表示'),
    async execute(interaction) {
        const stats = getTodayStats();
        
        const embed = new EmbedBuilder()
            .setTitle('📊 今日の対応統計')
            .setColor(0x00FF00)
            .setTimestamp();
        
        if (stats.totalResponses === 0) {
            embed.setDescription('今日はまだ対応がありません。');
        } else {
            let description = `**総対応件数:** ${stats.totalResponses}件\n**対応者数:** ${stats.totalResponders}人\n\n`;
            
            if (stats.responders.length > 0) {
                description += '**対応者別統計:**\n';
                stats.responders.forEach((responder, index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📋';
                    description += `${medal} **${responder.name}** - ${responder.count}件\n`;
                });
            }
            
            embed.setDescription(description);
        }
        
        embed.setFooter({ 
            text: `集計日: ${new Date(stats.date).toLocaleDateString('ja-JP')}` 
        });
        
        await interaction.reply({ embeds: [embed] });
    },
};