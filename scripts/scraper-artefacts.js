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
            const nom = $(el).find('h5')
                .text().trim();
            const thumb = $(el).find('.elementor-element-9f2ca69')
                .find('img').attr('data-src');

            const { data: ficheHTML } = await axios.get(url);
            const $$ = cheerio.load(ficheHTML);

            const origine = $$('.elementor-post-info__terms-list')
                .contents().text().trim()
                || null;
            const img = $$('.elementor-element-daf6008')
                .find('img').attr('data-src')
                || null;
            const sources_obtention = $$('.elementor-element-883b788')
                .find('ol:first')
                .text().trim()
                .split('\n');
            const tous_conseils = $$('.elementor-element-6c6ae26')
                .find('ul li');
            const top = ($$(tous_conseils).first().text().startsWith('TOP'))
                ? $$(tous_conseils).first().text().replace('TOP :', '').trim()
                : null;
            const good = ($$(tous_conseils).first().text().startsWith('GOOD'))
                ? $$(tous_conseils).first().text().replace('GOOD :', '').trim()
                : null
                    || ($$(tous_conseils).length > 0 && $$(tous_conseils).eq(1).text().startsWith('GOOD'))
                    ? $$(tous_conseils).eq(1).text().replace('GOOD :', '').trim()
                    : null;
            const ok = ($$(tous_conseils).first().text().startsWith('OK'))
                ? $$(tous_conseils).first().text().replace('OK :', '').trim()
                : null
                    || ($$(tous_conseils).length > 0 && $$(tous_conseils).eq(1).text().startsWith('OK'))
                    ? $$(tous_conseils).eq(1).text().replace('OK :', '').trim()
                    : null
                        || ($$(tous_conseils).length > 1 && $$(tous_conseils).eq(2).text().startsWith('OK'))
                        ? $$(tous_conseils).eq(2).text().replace('OK :', '').trim()
                        : null;


            artefacts.push({
                nom,
                url,
                thumb,
                origine,
                img,
                sources_obtention,
                personnages_conseilles: {
                    top,
                    good,
                    ok
                }
            });
        }

        fs.writeFileSync('./data/artefacts.json', JSON.stringify(artefacts, null, 2), 'utf-8');
        log(`✅ Artefacts à jour (${artefacts.length})`);
    } catch (err) {
        console.error('❌ Une erreur est survenue :', err.message);
    }
})();
