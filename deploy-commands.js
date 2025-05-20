require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const { log } = require('./utils/logger');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Récupérer toutes les données des commandes dans le dossier commands
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    log('Déploiement des commandes slash en cours...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    log('Commandes déployées avec succès !');
  } catch (error) {
    console.error(error);
  }
})();
