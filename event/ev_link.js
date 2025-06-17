const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

// Gestion link
function event_link(client) {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton() || !interaction.customId.includes('link')) return;

        const [action, type, uid] = interaction.customId.split('_');
        const embed = new EmbedBuilder()
            .setColor(0xA65E2E) // terre cuite
        if (action === 'confirm' && type === 'link' && uid) {
            let data = require('../data/profils.json');
            // anti spam sur les boutons semi permanents
            if (data[interaction.user.id]) {
                await interaction.update({
                    embeds: [embed
                        .setDescription(`❌ L'opération déjà abouti.`)
                    ],
                });
            }
            else {
                data[interaction.user.id] = uid;
                fs.writeFileSync('./data/profils.json', JSON.stringify(data, null, 2));
            }

            await interaction.reply({
                embeds: [embed
                    .setDescription(`✅ ${interaction.member.nickname || interaction.user.globalName}, ton compte Genshin, **UID ${uid}**, est maintenant lié à ton profil Discord.`)
                    .setTimestamp()
                ],
                ephemeral: false,
            });
        } else if (action === 'cancel' && type === 'link') {
            await interaction.update({
                embeds: [embed
                    .setDescription(`❌ L'opération a été annulée.`)
                ],
            });
        }
    });
}

module.exports = { event_link };
