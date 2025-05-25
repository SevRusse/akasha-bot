const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const personnages = require('../data/personnages.json');
const stats = require('../data/stats.json');
const fs = require('fs');

const elementColors = {
    'Anémo': 0x5EDFC5,    // turquoise clair
    'Géo': 0xD4AF37,      // or jaune/ocre
    'Électro': 0x8A2BE2,  // violet électrique
    'Dendro': 0x228B22,   // vert forêt
    'Hydro': 0x1E90FF,    // bleu océan
    'Pyro': 0xFF4500,     // rouge feu
    'Cryo': 0xADD8E6      // bleu clair (blanc/bleu)
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('farm')
        .setDescription('Affiche la fiche de farm d\'un personnage Genshin Impact')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Nom du personnage')
                .setRequired(true)
                .setAutocomplete(true)),

    async execute(interaction) {
        const nom = interaction.options.getString('nom');
        const perso = personnages.find(p => p.nom === nom)
        if (!perso) {
            return interaction.reply({ content: '❌ Personnage introuvable.', ephemeral: true });
        }

        const color = elementColors[perso.element] ?? 0x5865F2; // couleur par défaut

        const embed = new EmbedBuilder()
            .setTitle(perso.nom)
            .setURL(perso.url)
            .setImage(perso.farm)
            .setThumbnail(perso.thumb)
            .setDescription(
                `${perso.description}\n\n` +
                `Clique sur le lien ci-dessus pour consulter la fiche de farm complète d${('aeiouyé'.includes(perso.nom.toLowerCase()[0]) && !'aeiouyé'.includes(perso.nom.toLowerCase()[1])) ? '\'' : 'e '}**${perso.nom}** sur le site de la Gazette de Teyvat.`
            )
            .setColor(color)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        (stats[nom] ? stats[nom]++ : 0);
        fs.writeFileSync('./data/stats.json', JSON.stringify(stats, null, 2), 'utf-8');
    },

    // Cette fonction est spécifique pour gérer l'autocomplétion
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        // Filtrer les suggestions selon ce que l'utilisateur tape
        const suggestions = personnages.filter(p => p.nom
            .toLowerCase()
            .includes(focusedValue.toLowerCase()))
            .slice(0, 25) // max 25 suggestions
            .map(p => ({ name: p.nom, value: p.nom }));

        await interaction.respond(suggestions);
    }
};
