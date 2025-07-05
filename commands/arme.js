const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

// Couleurs de l'Embed selon la rareté de l'arme
const rarityColors = {
    '3★': 0x5EDFC5,    // armes 3★
    '4★': 0x8A2BE2,    // armes 4★
    '5★': 0xD4AF37,    // armes 5★
};

async function fetchNomArmes() {
    const res = await axios.get('https://lagazettedeteyvat.fr/armes');
    const $ = cheerio.load(res.data);
    return $('a.elementor-element h5')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(Boolean);
}

async function fetchInfosArme(nomRecherche) {
    const res = await axios.get('https://lagazettedeteyvat.fr/armes');
    const $ = cheerio.load(res.data);
    const linkEl = $('a.elementor-element').filter((_, el) =>
        $(el).find('h5').text().trim().toLowerCase()
        === nomRecherche.toLowerCase())
        .first();
    if (!linkEl.length) return;

    const url = linkEl.attr('href');
    const thumb = linkEl.find('.elementor-element-9f2ca69 img').first().attr('data-src');

    // Aller chercher dans la page de l'arme
    const pageArme = await axios.get(url);
    const $$ = cheerio.load(pageArme.data);
    const rarete = $$('.elementor-post-info__terms-list-item')
        .filter((_, el) => $$(el).text()?.includes('★'))
        .first().text().trim();
    const armeImage = $$('div.elementor-element-319df57').find('img').first().attr('data-src');
    const conseils = $$('div.elementor-element-bc4175c').find('ul:last').text().trim().replaceAll('’', '\'').split('\n');

    return {
        nom: linkEl.find('h5').text().trim(),
        url,
        thumb,
        classe: linkEl.find('div.elementor-element-c8d236c img').attr('alt'),
        stat: linkEl.find('div.elementor-element-73c3fb1 img').attr('alt'),
        obtention: linkEl.find('div.elementor-element-5247fa5 img').attr('alt'),
        rarete,
        armeImage,
        materiaux_arme: $$('div.elementor-element-bc4175c').find('ul:first').text().trim().replaceAll('’', '\'').split('\n'),
        personnages_conseilles: {
            top: conseils.filter(s => s.toLowerCase().startsWith('top')),
            good: conseils.filter(s => s.toLowerCase().startsWith('good')),
            ok: conseils.filter(s => s.toLowerCase().startsWith('ok')),
        }
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('arme')
        .setDescription('Affiche les infos pour une arme de Genshin Impact')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Nom de l\'arme')
                .setRequired(true)
                .setAutocomplete(true)),

    // Cette fonction est spécifique pour gérer l'autocomplétion
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused().toLowerCase();
        // Filtrer les suggestions selon ce que l'utilisateur tape
        const suggestions = (await fetchNomArmes())
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
        const arme = await fetchInfosArme(nom);
        if (!arme) {
            return interaction.editReply({
                content: '❌ Arme introuvable.',
                flags: MessageFlags.Ephemeral
            });
        }

        const color = rarityColors[arme.rarete] ?? 0x5865F2; // couleur par défaut
        const elision = ('aâeéiou'.includes(arme.nom.toLowerCase()[0])) ? '\'' : 'e ';
        const embed = new EmbedBuilder()
            .setTitle(`${arme.rarete} ${arme.nom}`)
            .setURL(arme.url)
            .setDescription(
                `**Classe :** ${arme.classe}\n` +
                `**Stat :** ${arme.stat}\n` +
                `**Obtention :** ${arme.obtention}\n\n` +
                `Cliquez sur le lien ci-dessus pour consulter la fiche complète d${elision}**${arme.nom}** sur le site de la Gazette de Teyvat.`
            )
            .setColor(color)
            .setImage(arme.armeImage)
            .setThumbnail(arme.thumb)
            .addFields(
                {
                    name: 'Matériaux d\'élévation d\'arme',
                    value: `${arme.materiaux_arme
                        .map(s => '**•** ' + s
                            // Simplifier le contenu
                            .replaceAll(/[^:]*\(|\)/g, ' '))
                        .join('\n')}`,
                    inline: true
                },
                {
                    name: 'Personnages conseillés',
                    value:
                        `${arme.personnages_conseilles.top.length ? `**•** ${arme.personnages_conseilles.top}\n` : ''}` +
                        `${arme.personnages_conseilles.good.length ? `**•** ${arme.personnages_conseilles.good}\n` : ''}` +
                        `${arme.personnages_conseilles.ok.length ? `**•** ${arme.personnages_conseilles.ok}\n` : ''}`,
                    inline: true
                }
            )
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed]
        });
    }
};
