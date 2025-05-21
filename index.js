require('dotenv').config();
const cron = require('node-cron');
const upPersonnages = require('./scripts/scraper-personnages');
const upArmes = require('./scripts/scraper-armes');
const upArtefacts = require('./scripts/scraper-artefacts');
const { log } = require('./utils/logger');

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    log(`Akasha est en ligne ! Connecté en tant que ${client.user.tag}`);
    client.user.setActivity('/personnage', { type: 'LISTENING' });
});

client.on('interactionCreate', async interaction => {
    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try{
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
    }
});

// cron exécute les scrapers à intervalle régulier => automatisation
cron.schedule('0 0 1 * *', async () => { // tous les 1er de chaque mois
    log('⏳ Mise à jour automatique des contenus...');
    await upPersonnages();
    await upArmes();
    await upArtefacts();
});

// gestion manuelle des crashs
client.on('error', err => log('Erreur client Discord', err));
process.on('unhandledRejection', err => log('Rejection non capturée', err));
process.on('uncaughtException', err => log('Exception non capturée', err));

client.login(process.env.TOKEN);
