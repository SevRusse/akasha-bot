const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const artefacts = require('../data/artefacts.json');
const stats = require('../data/stats.json');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('artefact')
        .setDescription('Affiche la fiche d’un set d’artefacts Genshin Impact')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Nom du set d’artefacts')
                .setRequired(true)
                .setAutocomplete(true)),

    async execute(interaction) {
        const nom = interaction.options.getString('nom');
        const arte = artefacts.find(a => a.nom === nom)
        if (!arte) {
            return interaction.reply({content: '❌ Set d\'artefacts introuvable.', ephemeral: true});
        }

        const color = 0xD4AF37; // couleur 5★

        const embed = new EmbedBuilder()
            .setTitle(arte.nom)
            .setURL(arte.url)
            .setImage(arte.img)
            .setThumbnail(arte.thumb)
            .setDescription(`
Obtention : ${arte.origine}

Clique sur le lien ci-dessus pour consulter la fiche complète d${('aeiouyé'.includes(arte.nom.toLowerCase()[0]) && !'aeiouyé'.includes(arte.nom.toLowerCase()[1])) ? '\'' : 'e '}**${arte.nom}** sur le site de la Gazette de Teyvat.
                `)
            .setColor(color)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        (stats[nom]++ ? stats[nom] : 0);
        fs.writeFileSync('../data/stats.json', JSON.stringify(stats, null, 2), 'utf-8');
    },

    // Cette fonction est spécifique pour gérer l'autocomplétion
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        // Filtrer les suggestions selon ce que l'utilisateur tape
        const suggestions = artefacts.filter(a => a.nom
            .toLowerCase()
            .includes(focusedValue.toLowerCase()))
            .slice(0, 25) // max 25 suggestions
            .map(a => ({ name: a.nom, value: a.nom}));

        await interaction.respond(suggestions);
    }
};
