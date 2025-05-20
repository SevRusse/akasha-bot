require('dotenv').config();
const cron = require('node-cron');
const upPersonnages = require('./scripts/scraper-personnages')
const upArmes = require('./scripts/scraper-armes')
const upArtefacts = require('./scripts/scraper-artefacts')

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
    console.log(`Akasha est en ligne ! Connecté en tant que ${client.user.tag}`);
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
    console.log('⏳ Mise à jour automatique des personnages...');
    await upPersonnages();
    await upArmes();
    await upArtefacts();
});

client.login(process.env.TOKEN);
