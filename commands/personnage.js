const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

// Couleurs de l'Embed selon l'élément du personnage
const elementColors = {
    'Anémo': 0x5EDFC5,    // turquoise clair
    'Géo': 0xD4AF37,      // or jaune/ocre
    'Électro': 0x8A2BE2,  // violet électrique
    'Dendro': 0x228B22,   // vert forêt
    'Hydro': 0x1E90FF,    // bleu océan
    'Pyro': 0xFF4500,     // rouge feu
    'Cryo': 0xADD8E6      // bleu clair (blanc/bleu)
};

async function fetchNomPersonnages() {
    const res = await axios.get('https://lagazettedeteyvat.fr/personnages');
    const $ = cheerio.load(res.data);
    return $('a.elementor-element h5')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(Boolean);
}

async function fetchInfosPersonnage(nomRecherche) {
    const res = await axios.get('https://lagazettedeteyvat.fr/personnages');
    const $ = cheerio.load(res.data);
    const linkEl = $('a.elementor-element').filter((_, el) =>
        $(el).find('h5').text().trim().toLowerCase()
        === nomRecherche.toLowerCase()
    ).first();
    if (!linkEl.length) return;

    const url = linkEl.attr('href');
    const thumb = linkEl.find('.elementor-element-9f2ca69 img').first().attr('data-src');

    // Aller chercher le build dans la page du personnage
    const pagePerso = await axios.get(url);
    const $$ = cheerio.load(pagePerso.data);
    const rarete = $$('.elementor-post-info__terms-list-item')
        .filter((_, el) => $$(el).text()?.includes('★'))
        .first().text().trim();
    const buildImage = $$('img').filter((_, el) =>
        $$(el).attr('data-src')?.includes('build')
    ).first().attr('data-src');

    return {
        nom: linkEl.find('h5').text().trim(),
        url,
        thumb,
        rarete,
        element: linkEl.find('div.elementor-element-c40c4b3 img').attr('alt'),
        classe: linkEl.find('div.elementor-element-c8d236c img').attr('alt'),
        stat: linkEl.find('div.elementor-element-73c3fb1 img').attr('alt'),
        role: $$('h3').first().text().trim(),
        buildImage,
        armes_conseillees: $$('.elementor-element-52edd3c, .elementor-element-c9f5115').find('ol:first').text().trim().replaceAll('’', '\'').split('\n'),
        sets_conseilles: $$('.elementor-element-52edd3c, .elementor-element-c9f5115').find('ol:last').text().trim().replaceAll('’', '\'').split('\n')
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('personnage')
        .setDescription('Affiche les infos de build pour un personnage de Genshin Impact')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Nom du personnage')
                .setRequired(true)
                .setAutocomplete(true)),

    // Cette fonction est spécifique pour gérer l'autocomplétion
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused().toLowerCase();
        // Filtrer les suggestions selon ce que l'utilisateur tape
        const suggestions = (await fetchNomPersonnages())
            .filter(n => n
                .toLowerCase()
                .includes(focused))
            .slice(0, 25) // Limite de 25 suggestions
            .map(s => ({ name: s, value: s }));
        await interaction.respond(suggestions);
    },

    async execute(interaction) {
        // ••• *Bot* réfléchit...
        await interaction.deferReply();

        const nom = interaction.options.getString('nom');
        const perso = await fetchInfosPersonnage(nom);
        if (!perso) {
            return interaction.editReply({
                content: '❌ Personnage introuvable.',
                flags: MessageFlags.Ephemeral
            });
        }

        const color = elementColors[perso.element] ?? 0x5865F2; // couleur par défaut
        const elision = ('aâeéiou'.includes(perso.nom.toLowerCase()[0])) ? '\'' : 'e ';
        const embed = new EmbedBuilder()
            .setTitle(`${perso.rarete} ${perso.nom}`)
            .setURL(perso.url)
            .setDescription(
                `**Élément :** ${perso.element}\n` +
                `**Classe :** ${perso.classe}\n` +
                `**Stat :** ${perso.stat}\n` +
                `**Rôle :** ${perso.role}\n\n` +
                `Chaque personnage peut posséder plusieurs rôles différents, seul le premier est affiché ici.\n` +
                `Cliquez sur le lien ci-dessus pour consulter la fiche de build complète d${elision}**${perso.nom}** sur le site de la Gazette de Teyvat.`
            )
            .setColor(color)    // Adaptable selon l’élément
            .setImage(perso.buildImage)
            .setThumbnail(perso.thumb)
            .addFields(
                {
                    name: 'Armes conseillées',
                    value: `${perso.armes_conseillees.map((s, i) =>
                        `**${i + 1}.** ` + s)
                        .join('\n')}`,
                    inline: true
                },
                {
                    name: 'Sets conseillés',
                    value: `${perso.sets_conseilles.map((s, i) =>
                        `**${i + 1}.** ` + s)
                        .join('\n')}`,
                    inline: true
                }
            )
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed]
        });
    }
};
