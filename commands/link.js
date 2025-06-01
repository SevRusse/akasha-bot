const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const profils = require('../data/profils.json');
// const { log } = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Associe ton UID Genshin Impact avec ton profil Discord')
        .addStringOption(option =>
            option.setName('uid')
                .setDescription('Ton UID Genshin Impact')
                .setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const uid = interaction.options.getString('uid');
        const embed = new EmbedBuilder()
            .setColor(0xA65E2E) // terre cuite

        // Vérification UID
        if (!/^\d{9}$/.test(uid)) {
            return interaction.reply({
                embeds: [embed
                    .setDescription('❌ UID invalide. Il doit comporter **exactement 9 chiffres**.')
                ],
                ephemeral: true
            });
        }
        if (!uid.startsWith('7')) {
            return interaction.reply({
                embeds: [embed
                    .setDescription('❌ UID invalide. Il doit commencer par **le chiffre 7**.')
                ],
                ephemeral: true
            });
        }

        // Gestion base de données
        if (profils[userId]) {
            return interaction.reply({
                embeds: [embed
                    .setDescription('❌ Vous avez déjà lié votre profil Discord.')
                ],
                ephemeral: true
            });
        }

        try {
            const { data } = await axios.get(`https://enka.network/api/uid/${uid}`).catch(
                function () {
                    return interaction.reply({
                        embeds: [embed
                            .setDescription(`❌ Aucun profil Genshin trouvé pour l'UID **${uid}**.`)
                        ],
                        ephemeral: true,
                    });
                }
            );

            const info = data.playerInfo;
            const pseudo = info.nickname || 'Voyageur';
            const ar = info.level || 0;
            const wl = info.worldLevel || 0;
            const signature = info.signature || 'Aucune signature';

            const { data: html } = await axios.get(`https://enka.network/u/${uid}`);
            const $ = cheerio.load(html);
            const avatarUrl =
                'https://enka.network' + `${$('.svelte-ea8b6b').find('img').attr('src')}`
                // Paimon par défaut
                || 'https://enka.network/ui/UI_AvatarIcon_Paimon.png';

            embed.setTitle('Est-ce bien vous ?')
                .setThumbnail(avatarUrl)
                .setDescription('Voici le profil associé :')
                .addFields(
                    { name: 'Pseudo', value: pseudo, inline: true },
                    { name: 'Niveau d\'aventure', value: `${ar}`, inline: true },
                    { name: 'Niveau de monde', value: `${wl}`, inline: true },
                    { name: 'Signature', value: signature, inline: false }
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm_link_${uid}`)
                    .setLabel('✅ Confirmer')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancel_link')
                    .setLabel('❌ Annuler')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true,
            });

        }
        catch (err) {
            console.error(err);
            return interaction.reply({
                embeds: [embed
                    .setDescription('❌ Une erreur est survenue lors de la vérification de l\'UID.')
                ],
                ephemeral: true,
            });
        }
    }
};
