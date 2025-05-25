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
                '**/arme** - Affiche la fiche d\'une arme\n' +
                '**/artefact** - Affiche la fiche d\'un set d\'artefacts\n' +
                '**/ennemi** - Affiche la fiche d\'un boss ou d\'une légende locale\n' +
                '**/farm** - Affiche la fiche de farm d\'un personnage\n' +
                '**/help** - Affiche cette page\n' +
                '**/personnage** - Affiche la fiche de build d\'un personnage\n'
            )
            .setColor(0xFFFFFF)
            .setTimestamp();

        await interaction.reply({embeds: [embed], ephemeral: true});
        (stats['help'] ? stats['help']++ : 0);
        fs.writeFileSync('./data/stats.json', JSON.stringify(stats, null, 2), 'utf-8');
    }
};
