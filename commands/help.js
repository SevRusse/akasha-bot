const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche les commandes disponibles'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Commandes disponibles')
            .setDescription(
                '**/help** - Affiche cette page\n'
            )
            .setThumbnail('https://enka.network/ui/UI_AvatarIcon_Paimon.png')
            .setColor(0xFFFFFF)
            .addFields(
                {
                    name: '***__Informations globales__ (La Gazette de Teyvat)***',
                    value:
                        '**/arme** - Affiche la fiche d\'une arme\n' +
                        '**/artefact** - Affiche la fiche d\'un set d\'artefacts\n' +
                        '**/ennemi** - Affiche la fiche d\'un boss ou d\'une légende locale\n' +
                        '**/farm** - Affiche la fiche de farm d\'un personnage\n' +
                        '**/personnage** - Affiche la fiche de build d\'un personnage\n'
                },
                {
                    name: '***__Liaison à Genshin Impact__***',
                    value:
                        '**/link** - Associe un compte Genshin Impact à Discord\n' +
                        '**/unlink** - Retire l\'association un UID à Discord\n',
                },
            )
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });
    }
};
