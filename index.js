require('dotenv').config();
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');

const { log } = require('./utils/logger');

// serveur Express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000; // Render fournit automatiquement process.env.PORT

app.get('/', (_, res) => res.send('Bot is alive!'));
app.listen(PORT, () => {
    log(`✅ Serveur Express en ligne sur le port ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
    log(`Akasha est en ligne ! Connecté en tant que ${client.user.tag}`);
});

// Gestion autocomplétion
client.on('interactionCreate', async interaction => {
    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
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

// Gestion des événements
require('./event/ev_say').event_say(client);

// Gestion manuelle des crashs
client.on('error', err => log('Erreur client Discord', err));
process.on('unhandledRejection', err => log('Rejection non capturée', err));
process.on('uncaughtException', err => log('Exception non capturée', err));

client.login(process.env.TOKEN);
