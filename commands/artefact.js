const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const artefacts = require('../data/artefacts.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('artefact')
        .setDescription('Affiche la fiche d\'un set d\'artefacts Genshin Impact')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Nom du set d\'artefacts')
                .setRequired(true)
                .setAutocomplete(true)),

    async execute(interaction) {
        const nom = interaction.options.getString('nom');
        const arte = artefacts.find(a => a.nom === nom)
        if (!arte) {
            return interaction.reply({
                content: '❌ Set d\'artefacts introuvable.',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(arte.nom)
            .setURL(arte.url)
            .setImage(arte.img)
            .setThumbnail(arte.thumb)
            .setColor(0xD4AF37) // couleur 5★
            .setDescription(
                `Origine : ${arte.origine}\n\n` +
                `Clique sur le lien ci-dessus pour consulter la fiche complète du set d'artefacts **${arte.nom}** sur le site de la Gazette de Teyvat.`
            )
            .addFields(
                {
                    name: 'Sources d\'obtention',
                    value: `${arte.sources_obtention.map((s, i) =>
                        `${i + 1}. ` + s)
                        .join('\n')}`,
                    inline: true
                },
                {
                    name: 'Personnages conseillés',
                    value: `${(arte.personnages_conseilles.top !== 'hihi'
                        && arte.personnages_conseilles.good !== 'haha'
                        && arte.personnages_conseilles.ok !== 'hoho')
                        ? `${arte.personnages_conseilles.top
                            ? '**• TOP** : ' + arte.personnages_conseilles.top + '\n'
                            : ''
                        }${arte.personnages_conseilles.good
                            ? '**• GOOD** : ' + arte.personnages_conseilles.good + '\n'
                            : ''
                        }${arte.personnages_conseilles.ok
                            ? '**• OK** : ' + arte.personnages_conseilles.ok + '\n'
                            : ''
                        }`
                        : 'Aucun personnage conseillé :/'
                        }`,
                    inline: true
                }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    // Cette fonction est spécifique pour gérer l'autocomplétion
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        // Filtrer les suggestions selon ce que l'utilisateur tape
        const suggestions = artefacts.filter(a => a.nom
            .toLowerCase()
            .includes(focusedValue.toLowerCase()))
            .slice(0, 25) // max 25 suggestions
            .map(a => ({ name: a.nom, value: a.nom }));

        await interaction.respond(suggestions);
    }
};
