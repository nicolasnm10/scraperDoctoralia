import cheerio from 'cheerio';
import axios from 'axios';
import { PromisePool } from '@supercharge/promise-pool';

const getListProfessionals = async (url: string) => {
    console.log(url);
    const response = await axios.get(url);
    if (response.status !== 200) {
        console.error('Error al obtener la página');
        return [];
    }
    const resultslinkperfil = [];

    try {
        const html = response.data;
        const $ = cheerio.load(html);

        const div = $('#search-content');
        const divsConClase = div.find('div.col-lg-6.result-column.p-2');
        const resultslinknextpage = [];
        divsConClase.each((_index, element) => {
            const contenidoHtml = $(element);
            const contenth3 = $(contenidoHtml).find('h3.h4.mb-0.flex-wrap');
            const alinkperfil = $(contenth3).find('a.text-body').attr('href');
            console.log(alinkperfil);

            resultslinkperfil.push({
                alinkperfil
            });
        });
        const ulnexturls = $('ul.pagination.pagination-lg');
        ulnexturls.each((_index, ulElement) => {
            const nexturl = $(ulElement).find('li');
            // console.log(nexturl.html(),'next');
            nexturl.each((_liIndex, liElement) => {
                const contenidoHtml = $(liElement);
                // console.log(contenidoHtml.html(),'liindex');
                const alinknextpage = $(contenidoHtml)
                    .find('a.page-link')
                    .attr('href');
                // console.log(alinknextpage,'aaa')
                resultslinknextpage.push({
                    alinknextpage
                });
            });
        });
    } catch (e) {
        console.error(`Error al obtener la página error: ${e}`);
        return [];
    }

    return resultslinkperfil;
};

const processPage = async () => {
    let results = [];
    let page = 1;
    const numbersPage = 10;
    while (true) {
        try {
            const listPages = Array.from(
                { length: numbersPage },
                (_, index) => page + index
            );
            console.log({ listPages });
            const { results: resultList, errors } =
                await PromisePool.withConcurrency(numbersPage)
                    .for(listPages)
                    .process(async (page) => {
                        const url = `https://www.doctoralia.cl/kinesiologo/${page}`;
                        console.log(`Get List Page ${page}`);
                        const urls = await getListProfessionals(url);
                        console.log({ urls });
                        return urls;
                    });
            console.log('poolResults:', resultList);
            console.log({ errors });
            results = results.concat(resultList.flat());
            page = page + numbersPage;
            break;
            // return list;
        } catch (error) {
            console.error('Otro error:', error.message);
            // if (error.response && error.response.status === 404) {
            //     console.error(
            //         `Error 404: La página ${url} no fue encontrada. Finalizando el proceso.`
            //     );
            //     // return null;
            //     break;
            // } else {
            //     console.error('Otro error:', error.message);
            //     return null;
            // }
        }
    }
    return results;
};

export const Scraper = async () => {
    const results = await processPage();
    console.log('Results:', results);
    console.log('Results len:', results.length);
    return results;
    //) }
};
