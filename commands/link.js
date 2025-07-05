const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const supabase = require('../utils/supabase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Associe ton UID Genshin Impact avec ton profil Discord')
        .addStringOption(option =>
            option.setName('uid')
                .setDescription('Ton UID Genshin Impact')
                .setRequired(true)),

    async execute(interaction) {
        // ••• *Bot* réfléchit...
        await interaction.deferReply();

        const genshin_uid = interaction.options.getString('uid');
        const discord_uid = interaction.user.id;
        const embed = new EmbedBuilder()
            .setColor(0xA65E2E); // terre cuite

        // Fetch data
        let { data: profiles, errorFetch } = await supabase
            .from('profiles')
            .select()
            .eq('discord_uid', discord_uid);

        if (profiles.length)
            return interaction.editReply({
                embeds: [embed
                    .setDescription('❌ Vous avez déjà lié votre profil Discord.')
                ],
                flags: MessageFlags.Ephemeral
            });

        // Vérification UID
        if (!/^\d{9}$/.test(genshin_uid)) {
            return interaction.editReply({
                embeds: [embed
                    .setDescription('❌ UID invalide. Il doit comporter **exactement 9 chiffres**.')
                ],
                flags: MessageFlags.Ephemeral
            });
        }
        if (!genshin_uid.startsWith('7')) {
            return interaction.editReply({
                embeds: [embed
                    .setDescription('❌ UID invalide. Il doit commencer par **le chiffre 7**.')
                ],
                flags: MessageFlags.Ephemeral
            });
        }

        const { data: enkaApi } = await axios.get(`https://enka.network/api/uid/${genshin_uid}`)
            .catch(
                function () {
                    return interaction.editReply({
                        embeds: [embed
                            .setDescription(`❌ Aucun profil Genshin trouvé pour l'UID **${genshin_uid}**.`)
                        ],
                        flags: MessageFlags.Ephemeral
                    });
                }
            );

        const { data: enkaHtml } = await axios.get(`https://enka.network/u/${genshin_uid}`);
        const $ = cheerio.load(enkaHtml);
        const avatarUrl = `https://enka.network${$('div.svelte-ea8b6b img').first().attr('src')}`;

        // Insert data
        const { error } = await supabase
            .from('profiles')
            .insert({ discord_uid: discord_uid, genshin_uid: genshin_uid });
        log(error);

        if (error) {
            return interaction.editReply({
                embeds: [embed
                    .setDescription('❌ Une erreur est survenue.')
                ],
                flags: MessageFlags.Ephemeral
            });
        }

        embed.setTitle('Lié avec succès')
            .setThumbnail(avatarUrl)
            .setDescription(`✅ ${interaction.member.nickname || interaction.user.globalName}, ton compte Genshin, **UID ${genshin_uid}**, est maintenant lié à ton profil Discord.`)
            .addFields(
                {
                    name: 'Pseudo',
                    value: enkaApi.playerInfo.nickname
                        || 'Voyageur',
                },
                {
                    name: 'Niveau d\'aventure',
                    value: `${enkaApi.playerInfo.level
                        || 0}`
                },
                {
                    name: 'Niveau de monde',
                    value: `${enkaApi.playerInfo.worldLevel
                        || 0}`
                },
                {
                    name: 'Signature',
                    value: enkaApi.playerInfo.signature
                        || 'Aucune signature',
                },
            );

        return interaction.editReply({
            embeds: [embed],
        });
    }
};
