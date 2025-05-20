const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { log } = require('../utils/logger');

const BASE_URL = 'https://lagazettedeteyvat.fr';

(async () => {
    try {
        const armes = [];

        const { data: html } = await axios.get(`${BASE_URL}/armes`);
        const $ = cheerio.load(html);

        const cartes = $('a.elementor-element'); // Cartes cliquables des armes
        for (const el of cartes) {
            const url = $(el).attr('href');
            const nom = $(el).find('h5').text().trim();
            const thumb = $(el).find('.elementor-element-9f2ca69').find('img').attr('data-src');

            const { data: ficheHTML } = await axios.get(url);
            const $$ = cheerio.load(ficheHTML);

            const rarete = $$('.elementor-post-info__terms-list-item').first().text().trim();
            const description = $$('.elementor-post-info__terms-list').contents().text().trim() || null;
            const img = $$('a img').first().attr('data-src') || null;

            armes.push({
                nom,
                url,
                thumb,
                rarete,
                description,
                img
            });
        }

        fs.writeFileSync('./data/armes.json', JSON.stringify(armes, null, 2), 'utf-8');
        log(`✅ Armes à jour (${armes.length})`);
    } catch (err) {
        console.error('❌ Une erreur est survenue :', err.message);
    }
})();
