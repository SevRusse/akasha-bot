const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche les commandes disponibles'),

  async execute(interaction) {
    await interaction.reply({
      embeds: [{
        title: '📖 Commandes disponibles',
        color: 0x2ecc71, // Vert
        description:
          '**/personnage** – Affiche la fiche d’un personnage Genshin\n' +
          '**/arme** – Affiche la fiche d’une arme\n' +
          '**/artefact** – Affiche la fiche d’un set d’artefacts\n',
        footer: {
          text: 'Akasha • Genshin Impact Utility Bot'
        }
      }],
      ephemeral: true
    });
  }
};
