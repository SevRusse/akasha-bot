const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche les commandes disponibles'),

    async execute(interaction) {
        await interaction.reply({
            embeds: [{
                title: 'Commandes disponibles',
                color: 0xFFFFFF,
                description:
                    '**/personnage** – Affiche la fiche d’un personnage Genshin\n' +
                    '**/arme** – Affiche la fiche d’une arme\n' +
                    '**/artefact** – Affiche la fiche d’un set d’artefacts\n',
            }],
            ephemeral: true
        });
    }
};
