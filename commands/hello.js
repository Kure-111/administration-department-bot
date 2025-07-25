const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('挨拶をします'),
    async execute(interaction) {
        await interaction.reply('こんにちは！管理部のbotです！👋');
    },
};