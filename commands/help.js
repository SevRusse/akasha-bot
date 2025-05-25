const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const stats = require('../data/stats.json');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche les commandes disponibles'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Commandes disponibles')
            .setDescription(
                '**/personnage** - Affiche la fiche d\'un personnage de Genshin Impact\n' +
                '**/arme** - Affiche la fiche d\'une arme\n' +
                '**/artefact** - Affiche la fiche d\'un set d\'artefacts\n' +
                '**/help** - Affiche cette page\n',
                )
            .setColor(0xFFFFFF)
            .setTimestamp();

        await interaction.reply({embeds: [embed], ephemeral: true});
        (stats['help'] ? stats['help']++ : 0);
        fs.writeFileSync('./data/stats.json', JSON.stringify(stats, null, 2), 'utf-8');
    }
};
