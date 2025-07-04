const { EmbedBuilder } = require("discord.js");

// Gestion feur
function event_say(client) {
    client.on('messageCreate', message => {
        // Ignorer le bot
        if (message.author.bot) return;

        embed = new EmbedBuilder()
            .setColor(0x30d5c8) // eau tropicale légère
            .setTimestamp();

        // quoi? FEUR!
        if (message.content.match(/.*q+u+o+i+.*/i)) {
            embed.setTitle('FEUR !')
                .setImage([
                    'https://cdn.discordapp.com/attachments/957348909896859648/1317503709235642390/clideo_editor_049cd1f8a08e490baed5f32bf8e08001.gif?ex=68522932&is=6850d7b2&hm=84d4a33f2e656bdb44f55423101ff30e0a8ed6af7f5626874167af1fb7a75857&',
                    'https://media.tenor.com/zvg8w0FkecYAAAAd/feur-theobabac.gif', // feur theobabac
                    'https://media.tenor.com/CJIntL3axZUAAAAd/feur-meme.gif' // feur universal
                ]
                // random selection
                [Math.floor(Math.random() * 3)]
            );
            message.reply({
                embeds: [embed],
            });
        }

        // what? ELSE!
        if (message.content.match(/.*w+h+a+t+.*/i)) {
            embed.setTitle('ELSE !')
                .setImage([
                    'https://cdn.discordapp.com/attachments/957346334501912619/1349833390005686292/meme.gif?ex=6852710e&is=68511f8e&hm=c4717d0769599b05ff96f21dba9e93c0eb5a239ae40759d3ec78ad5f811f9aa5&',
                    'https://media.tenor.com/64YYOGArZ9gAAAAC/jean-dujardin-what-else.gif', // what else? dujardin
                    'https://media.tenor.com/uYBczX3EgbAAAAAC/caffe-nespresso.gif' // what else? clooney
                ]
                // random selection
                [Math.floor(Math.random() * 3)]
            );
            message.reply({
                embeds: [embed],
            });
        }

        // oui? STITI!
        if (message.content.match(/.*o+u+i+.*/i)) {
            embed.setTitle('STITI !')
                .setImage([
                    'https://media.tenor.com/zsdfVhxp-qEAAAAC/stiti-ouistiti.gif', // stiti monkey
                    'https://media.tenor.com/B6yirzaDUdQAAAAd/stiti-oui.gif', // stiti
                    'https://media.tenor.com/TgBms16C0gwAAAAC/stiti-multicort.gif' // stiti minecraft
                ]
                // random selection
                [Math.floor(Math.random() * 3)]
            );
            message.reply({
                embeds: [embed],
            });
        }
    })
}

module.exports = { event_say };
