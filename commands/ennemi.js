const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ennemis = require('../data/ennemis.json');
const stats = require('../data/stats.json');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ennemi')
        .setDescription('Affiche la fiche d\'un ennemi Genshin Impact')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Nom de l\'ennemi')
                .setRequired(true)
                .setAutocomplete(true)),

    async execute(interaction) {
        const nom = interaction.options.getString('nom');
        const ennemi = ennemis.find(e => e.nom === nom)
        if (!ennemi) {
            return interaction.reply({ content: '❌ Ennemi introuvable.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(ennemi.nom)
            .setURL(ennemi.url)
            .setImage(ennemi.img)
            .setThumbnail(ennemi.thumb)
            .setDescription(
                `${ennemi.type} (${ennemi.description})\n\n` +
                `Clique sur le lien ci-dessus pour consulter la fiche complète d${('aeiouyé'.includes(ennemi.nom.toLowerCase()[0]) && !'aeiouyé'.includes(ennemi.nom.toLowerCase()[1])) ? '\'' : 'e '}**${ennemi.nom}** sur le site de la Gazette de Teyvat.`
            )
            .setColor(0x1e2a38)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        (stats[nom] ? stats[nom]++ : 0);
        fs.writeFileSync('./data/stats.json', JSON.stringify(stats, null, 2), 'utf-8');
    },

    // Cette fonction est spécifique pour gérer l'autocomplétion
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        // Filtrer les suggestions selon ce que l'utilisateur tape
        const suggestions = ennemis.filter(e => e.nom
            .toLowerCase()
            .includes(focusedValue.toLowerCase()))
            .slice(0, 25) // max 25 suggestions
            .map(e => ({ name: e.nom, value: e.nom }));

        await interaction.respond(suggestions);
    }
};
