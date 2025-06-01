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
            const thumb = $(el).find('.elementor-element-9f2ca69')
                .find('img').attr('data-src');

            const { data: ficheHTML } = await axios.get(url);
            const $$ = cheerio.load(ficheHTML);

            const rarete = $$('.elementor-post-info__terms-list-item')
                .filter((_, e) =>
                    $$(e).text().length == 2)
                .text().trim();
            const description = $$('.elementor-post-info__terms-list')
                .contents().text().trim()
                || null;
            const img = $$('.elementor-element-319df57')
                .find('img').attr('data-src')
                || null;
            const materiaux_arme = $$('.elementor-element-fdd2766')
                .find('ul:first')
                .text().endsWith(')\n')
                ? $$('.elementor-element-fdd2766')
                    .find('ul:first')
                    .text().trim().replace(/((.+\()|(\)))/g, '')
                    .split('\n')
                : null;
            const tous_conseils = $$('.elementor-element-4546c48')
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

            armes.push({
                nom,
                url,
                thumb,
                rarete,
                description,
                img,
                materiaux_arme,
                personnages_conseilles: {
                    top,
                    good,
                    ok
                }
            });
        }

        fs.writeFileSync('./data/armes.json', JSON.stringify(armes, null, 2), 'utf-8');
        log(`✅ Armes à jour (${armes.length})`);
    } catch (err) {
        console.error('❌ Une erreur est survenue :', err.message);
    }
})();
