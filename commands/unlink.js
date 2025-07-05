const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const supabase = require('../utils/supabase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlink')
        .setDescription('Retire l\'association de ton UID Genshin Impact avec ton profil Discord'),

    async execute(interaction) {
        // ••• *Bot* réfléchit...
        await interaction.deferReply();

        const discord_uid = interaction.user.id;
        const embed = new EmbedBuilder()
            .setColor(0xA65E2E); // terre cuite

        // Fetch data
        let { data: profiles, errorFetch } = await supabase
            .from('profiles')
            .select()
            .eq('discord_uid', discord_uid);

        if (!profiles.length)
            return interaction.editReply({
                embeds: [embed
                    .setDescription('❌ Vous n\'avez pas lié votre profil Discord.')
                ],
                flags: MessageFlags.Ephemeral
            });

        // Delete data
        const response = await supabase
            .from('profiles')
            .delete()
            .eq('discord_uid', discord_uid)
            ;

        if (!response) {
            return interaction.editReply({
                embeds: [embed
                    .setDescription('❌ Une erreur est survenue.')
                ],
                flags: MessageFlags.Ephemeral
            });
        }

        embed.setTitle('Association retirée avec succès')
            .setDescription(`✅ ${interaction.member.nickname || interaction.user.globalName}, ton profil Discord n'est plus lié à un compte Genshin Impact.`);

        return interaction.editReply({
            embeds: [embed],
        });
    }
};
