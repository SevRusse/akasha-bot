const cron = require("node-cron");

const { log } = require("../utils/logger");
const upArmes = require('../scripts/scraper-armes');
const upArtefacts = require('../scripts/scraper-artefacts');
const upEnnemis = require('../scripts/scraper-ennemis');
const upPersonnages = require('../scripts/scraper-personnages');

// Scheduler
function scheduler() {
    cron.schedule('0 0 * * 1', async () => { // tous les lundis
        log('⏳ Mise à jour automatique des contenus...');
        await upPersonnages();
        await upArmes();
        await upArtefacts();
        await upEnnemis();
    });
}

module.exports = { scheduler };
