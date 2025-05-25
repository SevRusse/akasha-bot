const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { log } = require('../utils/logger');
const ennemi = require('../commands/ennemi');

const BASE_URL = 'https://lagazettedeteyvat.fr';

(async () => {
    try {
        const ennemis = [];

        const { data: html } = await axios.get(`${BASE_URL}/ennemis`);
        const $ = cheerio.load(html);

        const cartes = $('a.elementor-element'); // Cartes cliquables des armes
        for (const el of cartes) {
            const url = $(el).attr('href');
            const nom = $(el).find('h5').text().trim();
            const thumb = $(el).find('.elementor-element-9f2ca69').find('img').attr('data-src') || $(el).find('.elementor-element-c601f5b').find('img').attr('data-src') || null;

            const { data: ficheHTML } = await axios.get(url);
            const $$ = cheerio.load(ficheHTML);

            const titre = $$('.elementor-element-2911b67').find('h2').text().trim() || $$('.elementor-element-04499b2').find('h2').text().trim();
            // detection du type d'ennemi
            const type = `${(titre.endsWith('boss')) ? 'Boss du monde' : 'Légende locale'}`;
            const description = $$('.elementor-post-info__terms-list').contents().text().trim() || null;
            const img = $$('a img').first().attr('data-src') || null;

            ennemis.push({
                nom,
                url,
                thumb,
                type,
                description,
                img
            });
        }

        fs.writeFileSync('./data/ennemis.json', JSON.stringify(ennemis, null, 2), 'utf-8');
        log(`✅ Ennemis à jour (${ennemis.length})`);
    } catch (err) {
        console.error('❌ Une erreur est survenue :', err.message);
    }
})();
