import cheerio from 'cheerio';
import axios from 'axios';
import { PromisePool } from '@supercharge/promise-pool';
import { processPageP } from '../scraperProfessional/scraper_profesional';
export const getListProfessionals = async (url: string) => {
    console.log(url);
    try {
        const response = await axios.get(url);
        console.log({ status: response.status });
        if (response.status !== 200) {
            console.error('Error al obtener la página');
            return [];
        }
        const resultslinkperfil = [];
        const html = response.data;
        const $ = cheerio.load(html);
        const div = $('#search-content');
        const divsConClase = div.find('div.col-lg-6.result-column.p-2');
        const resultslinknextpage = [];
        divsConClase.each((_index, element) => {
            const contenidoHtml = $(element);
            const contenth3 = $(contenidoHtml).find('h3.h4.mb-0.flex-wrap');
            const alinkperfil = $(contenth3).find('a.text-body').attr('href');
            if (alinkperfil.match('/kinesiologo')) {
                resultslinkperfil.push(alinkperfil);
            }
        });
        const ulnexturls = $('ul.pagination.pagination-lg');
        ulnexturls.each((_index, ulElement) => {
            const nexturl = $(ulElement).find('li');
            nexturl.each((_liIndex, liElement) => {
                const contenidoHtml = $(liElement);
                const alinknextpage = $(contenidoHtml)
                    .find('a.page-link')
                    .attr('href');
                resultslinknextpage.push({
                    alinknextpage
                });
            });
        });
        return resultslinkperfil;
    } catch (e) {
        console.error(`Error al obtener la página error: ${e}`);
        return [];
    }
};

export const processPage = async () => {
    let results = [];
    let page = 1;
    const numbersPage = 2;
    while (page <= 2) {
        try {
            const listPages = Array.from(
                { length: numbersPage },
                (_, index) => page + index
            );
            const { results: resultList, errors } =
                await PromisePool.withConcurrency(numbersPage)
                    .for(listPages)
                    .process(async (page) => {
                        const url = `https://www.doctoralia.cl/kinesiologo/${page}`;
                        const urls = await getListProfessionals(url);
                        return urls;
                    });
            if (errors.length) {
                console.log({ errors });
                throw new Error('ERROR_FAILED_SCRAPER');
            }
            const flatresult = resultList.flat();
            if (!flatresult.length) {
                break;
            }
            results = results.concat(flatresult);
            page = page + numbersPage;
        } catch (error) {
            console.error('Otro error:', error.message);
        }
    }
    return results;
};

export const Scraper = async (webhook: string) => {
    const resultsUrl = await processPage();
    console.log('number url:', resultsUrl.length);
    const results_professional = await processPageP(resultsUrl);
    console.log('number url results:', results_professional.length);
    sendToWebhook(results_professional, webhook);

    //
    return results_professional;
};
const sendToWebhook = async (data: any, webhook: string) => {
    try {
        await axios.post(webhook, { data: data });
        console.log('Datos enviados al webhook correctamente.');
    } catch (error) {
        console.error('Error al enviar datos al webhook:', error.message);
    }
};
