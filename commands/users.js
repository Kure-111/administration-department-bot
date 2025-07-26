const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('users')
        .setDescription('サーバーメンバー一覧とDiscord ID表示'),
    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const guild = interaction.guild;
            await guild.members.fetch();
            
            // ボット以外のメンバーを取得
            const members = guild.members.cache.filter(member => !member.user.bot);
            
            if (members.size === 0) {
                await interaction.editReply('メンバーが見つかりませんでした。');
                return;
            }
            
            // メンバーリストを作成
            const memberList = members.map(member => {
                const displayName = member.displayName || member.user.username;
                const userId = member.user.id;
                return `**${displayName}**\n└ ID: \`${userId}\``;
            });
            
            // 文字数制限を考慮して分割
            const maxLength = 4000;
            const chunks = [];
            let currentChunk = '';
            
            for (const memberInfo of memberList) {
                if (currentChunk.length + memberInfo.length + 1 > maxLength) {
                    chunks.push(currentChunk);
                    currentChunk = memberInfo;
                } else {
                    currentChunk += (currentChunk ? '\n\n' : '') + memberInfo;
                }
            }
            if (currentChunk) chunks.push(currentChunk);
            
            // 最初のページを送信
            const embed = new EmbedBuilder()
                .setTitle('👥 サーバーメンバー一覧')
                .setDescription(chunks[0])
                .setColor(0x0099FF)
                .setFooter({ 
                    text: `総メンバー数: ${members.size}人 | ページ: 1/${chunks.length}` 
                })
                .setTimestamp();
                
            await interaction.editReply({ embeds: [embed] });
            
            // 複数ページがある場合は追加で送信
            for (let i = 1; i < chunks.length; i++) {
                const nextEmbed = new EmbedBuilder()
                    .setTitle('👥 サーバーメンバー一覧（続き）')
                    .setDescription(chunks[i])
                    .setColor(0x0099FF)
                    .setFooter({ 
                        text: `ページ: ${i + 1}/${chunks.length}` 
                    });
                    
                await interaction.followUp({ embeds: [nextEmbed] });
            }
            
        } catch (error) {
            console.error('Error fetching members:', error);
            await interaction.editReply('メンバー情報の取得中にエラーが発生しました。');
        }
    },
};