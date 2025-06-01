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
            const nom = $(el).find('h5')
                .text().trim();
            const thumb = $(el).find('.elementor-element-c40c4b3')
                .find('img').attr('data-src');
            const element = $(el).find('.elementor-element-c40c4b3')
                .find('img').attr('alt');

            const { data: ficheHTML } = await axios.get(url);
            const $$ = cheerio.load(ficheHTML);

            const description = $$('.elementor-post-info__terms-list')
                .contents().text().trim()
                || null;
            const role = $$('h3')
                .first().text().trim();
            const buildUrl = $$('img')
                .filter((_, e) =>
                    $$(e).attr('data-src')?.includes('build'))
                .attr('data-src')
                || null;
            const armes_conseillees = $$('.e-con-inner')
                .find('ol:first')
                .text().trim().replaceAll('’', '\'')
                .split('\n');
            const sets_conseilles = $$('.e-con-inner')
                .find('ol:nth(1)')
                .text().trim().replaceAll('’', '\'')
                .split('\n');

            const farmUrl = $$('.elementor-element-b4f7d09')
                .find('img').attr('data-src')
                || null;
            const materiaux_personnage = $$('.e-con-inner')
                .find('ul:first')
                .text().trim().replaceAll('’', '\'')
                .split('\n');
            const materiaux_aptitudes = $$('.e-con-inner')
                .find('ul:nth(1)')
                .text().trim().replaceAll('’', '\'')
                .split('\n');

            personnages.push({
                nom,
                url,
                thumb,
                element,
                description,
                build: {
                    role,
                    buildUrl,
                    armes_conseillees,
                    sets_conseilles,
                },
                farm: {
                    farmUrl,
                    materiaux_personnage,
                    materiaux_aptitudes
                }
            });
        }

        fs.writeFileSync('./data/personnages.json', JSON.stringify(personnages, null, 2), 'utf-8');
        log(`✅ Personnages à jour (${personnages.length})`);
    } catch (err) {
        console.error('❌ Une erreur est survenue :', err.message);
    }
})();
