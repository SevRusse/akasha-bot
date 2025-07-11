const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

async function fetchNomsArtefacts() {
    const res = await axios.get('https://lagazettedeteyvat.fr/artefacts');
    const $ = cheerio.load(res.data);
    return $('a.elementor-element h5')
        .map((_, el) => $(el).text().trim())
        .get();
}

async function fetchInfosArtefact(nomRecherche) {
    const res = await axios.get('https://lagazettedeteyvat.fr/artefacts');
    const $ = cheerio.load(res.data);
    const linkEl = $('a.elementor-element').filter((_, el) =>
        $(el).find('h5').text().trim().toLowerCase()
        === nomRecherche.toLowerCase())
        .first();
    if (!linkEl.length) return;

    const url = linkEl.attr('href');
    const thumb = linkEl.find('.elementor-element-9f2ca69 img').first().attr('data-src');

    // Aller chercher dans la page de l'artefact
    const pageArtefact = await axios.get(url);
    const $$ = cheerio.load(pageArtefact.data);
    const artefactImage = $$('div.elementor-element-daf6008 img').first().attr('data-src');
    const conseils = $$('div.elementor-element-737bbe6').find('ul:last').text().trim().replaceAll('’', '\'').split('\n');

    return {
        nom: linkEl.find('h5').text().trim(),
        url,
        thumb,
        origine: $$('.elementor-post-info__terms-list').text().trim(),
        artefactImage,
        sources_obtention: $$('div.elementor-element-737bbe6').find('ol:first').text().trim().replaceAll('’', '\'').split('\n'),
        personnages_conseilles: {
            top: conseils.filter(s => s.toLowerCase().startsWith('top')),
            good: conseils.filter(s => s.toLowerCase().startsWith('good')),
            ok: conseils.filter(s => s.toLowerCase().startsWith('ok')),
        }
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('artefact')
        .setDescription('Affiche les infos pour un set d\'artefacts de Genshin Impact')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Nom du set d\'artefacts')
                .setRequired(true)
                .setAutocomplete(true)),

    // Cette fonction est spécifique pour gérer l'autocomplétion
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused().toLowerCase();
        // Filtrer les suggestions selon ce que l'utilisateur tape
        const suggestions = (await fetchNomsArtefacts())
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
        const artefact = await fetchInfosArtefact(nom);
        if (!artefact) {
            return interaction.editReply({
                content: '❌ Set d\'artefacts introuvable.',
                flags: MessageFlags.Ephemeral
            });
        }

        const elision = ('aâeéiou'.includes(artefact.nom.toLowerCase()[0])) ? '\'' : 'e ';
        const embed = new EmbedBuilder()
            .setTitle(artefact.nom)
            .setURL(artefact.url)
            .setDescription(
                `**Origine :** ${artefact.origine}\n\n` +
                `Cliquez sur le lien ci-dessus pour consulter la fiche complète d${elision}**${artefact.nom}** sur le site de la Gazette de Teyvat.`
            )
            .setColor(0xD4AF37) // couleur 5★
            .setImage(artefact.artefactImage)
            .setThumbnail(artefact.thumb)
            .addFields(
                {
                    name: 'Sources d\'obtention',
                    value: `${artefact.sources_obtention.map((s, i) =>
                        `**${i + 1}.** ` + s)
                        .join('\n')}`,
                    inline: true
                },
                {
                    name: 'Personnages conseillés',
                    value:
                        `${artefact.personnages_conseilles.top.length ? `**•** ${artefact.personnages_conseilles.top}\n` : ''}` +
                        `${artefact.personnages_conseilles.good.length ? `**•** ${artefact.personnages_conseilles.good}\n` : ''}` +
                        `${artefact.personnages_conseilles.ok.length ? `**•** ${artefact.personnages_conseilles.ok}\n` : ''}`,
                    inline: true
                }
            )
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed]
        });
    }
};
