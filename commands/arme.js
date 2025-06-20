const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const armes = require('../data/armes.json');

const rarityColors = {
    '3★': 0x5EDFC5,    // armes 3★
    '4★': 0x8A2BE2,    // armes 4★
    '5★': 0xD4AF37,    // armes 5★
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('arme')
        .setDescription('Affiche la fiche d\'une arme Genshin Impact')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Nom de l\'arme')
                .setRequired(true)
                .setAutocomplete(true)),

    async execute(interaction) {
        const nom = interaction.options.getString('nom');
        const arme = armes.find(a => a.nom === nom)
        if (!arme) {
            return interaction.reply({
                content: '❌ Arme introuvable.',
                flags: MessageFlags.Ephemeral
            });
        }

        const color = rarityColors[arme.rarete] ?? 0x5865F2; // couleur par défaut

        const embed = new EmbedBuilder()
            .setTitle(arme.nom)
            .setURL(arme.url)
            .setImage(arme.img)
            .setThumbnail(arme.thumb)
            .setColor(color)
            .setDescription(
                `${arme.description}\n\n` +
                `Clique sur le lien ci-dessus pour consulter la fiche complète de l'arme **${arme.nom}** sur le site de la Gazette de Teyvat.`
            )
            .addFields(
                {
                    name: 'Matériaux d\'élévation d\'arme',
                    value: `${arme.materiaux_arme
                            ? `**• Donjon** : ${arme.materiaux_arme[0]}` + '\n' +
                            `**• Butin élite** : ${arme.materiaux_arme[1]}` + '\n' +
                            `**• Butin commun** : ${arme.materiaux_arme[2]}` + '\n'
                            : 'Voir la fiche de l\'arme'}`,
                    inline: true
                },
                {
                    name: 'Personnages conseillés',
                    value: `${(arme.personnages_conseilles.top !== 'hihi'
                        && arme.personnages_conseilles.good !== 'haha'
                        && arme.personnages_conseilles.ok !== 'hoho')
                        ? `${arme.personnages_conseilles.top
                            ? '**• TOP** : ' + arme.personnages_conseilles.top + '\n'
                            : ''
                        }${arme.personnages_conseilles.good
                            ? '**• GOOD** : ' + arme.personnages_conseilles.good + '\n'
                            : ''
                        }${arme.personnages_conseilles.ok
                            ? '**• OK** : ' + arme.personnages_conseilles.ok + '\n'
                            : ''
                        }`
                        : 'Aucun personnage conseillé :/'
                        }`,
                    inline: true
                }
            )
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    },

    // Cette fonction est spécifique pour gérer l'autocomplétion
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        // Filtrer les suggestions selon ce que l'utilisateur tape
        const suggestions = armes.filter(a => a.nom
            .toLowerCase()
            .includes(focusedValue.toLowerCase()))
            .slice(0, 25) // max 25 suggestions
            .map(a => ({
                name: a.nom,
                value: a.nom
            }));

        await interaction.respond(suggestions);
    }
};
