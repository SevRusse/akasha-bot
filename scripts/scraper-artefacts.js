const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { log } = require('../utils/logger');

const BASE_URL = 'https://lagazettedeteyvat.fr';

(async () => {
    try {
        const artefacts = [];

        const { data: html } = await axios.get(`${BASE_URL}/artefacts`);
        const $ = cheerio.load(html);

        const cartes = $('a.elementor-element'); // Cartes cliquables des artefacts
        for (const el of cartes) {
            const url = $(el).attr('href');
            const nom = $(el).find('h5').text().trim();
            const thumb = $(el).find('.elementor-element-9f2ca69').find('img').attr('data-src');

            const { data: ficheHTML } = await axios.get(url);
            const $$ = cheerio.load(ficheHTML);

            const origine = $$('.elementor-post-info__terms-list').contents().text().trim() || null;
            const img = $$('a img').first().attr('data-src') || null;

            artefacts.push({
                nom,
                url,
                thumb,
                origine,
                img
            });
        }

        fs.writeFileSync('./data/artefacts.json', JSON.stringify(artefacts, null, 2), 'utf-8');
        log(`✅ Artefacts à jour (${artefacts.length})`);
    } catch (err) {
        console.error('❌ Une erreur est survenue :', err.message);
    }
})();
