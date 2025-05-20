const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { log } = require('../utils/logger');

const BASE_URL = 'https://lagazettedeteyvat.fr';

(async () => {
    try {
        const personnages = [];

        const { data: html } = await axios.get(`${BASE_URL}/personnages`);
        const $ = cheerio.load(html);

        const cartes = $('a.elementor-element'); // Cartes cliquables des personnages
        for (const el of cartes) {
            const url = $(el).attr('href');
            const nom = $(el).find('h5').text().trim();
            const thumb = $(el).find('.elementor-element-c40c4b3').find('img').attr('data-src');
            const element = $(el).find('.elementor-element-c40c4b3').find('img').attr('alt');

            const { data: ficheHTML } = await axios.get(url);
            const $$ = cheerio.load(ficheHTML);

            const description = $$('.elementor-post-info__terms-list').contents().text().trim() || null;
            const img = $$('a img').first().attr('data-src') || null;

            personnages.push({
                nom,
                url,
                thumb,
                element,
                description,
                img
            });
        }

        fs.writeFileSync('./data/personnages.json', JSON.stringify(personnages, null, 2), 'utf-8');
        log(`✅ Personnages à jour (${personnages.length})`);
    } catch (err) {
        console.error('❌ Une erreur est survenue :', err.message);
    }
})();
