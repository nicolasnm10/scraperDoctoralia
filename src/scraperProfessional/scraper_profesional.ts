import cheerio from 'cheerio';
import axios from 'axios';
import { PromisePool } from '@supercharge/promise-pool';

function cleanText(text: string): string {
    return text
        .trim()
        .replace(/\t|\n|\s{2,}/g, '')
        .replace(/\s+/g, ' ')
        .replace(/•\s*\$[\d,.]+/, '');
}
function cleanPrice(text: string): string {
    return text
        .trim()
        .replace(/[^\d$€£¥]/g, '')
        .replace(/[^\w\s]/g, '');
}

function textToList(text: string) {
    if (text.length >= 1) {
        return text.trim().split(',');
    }
    return [];
}
function listToObject(
    listaClaves: any[],
    listaValores: any[]
): { [key: string]: any } {
    const resultado: { [key: string]: any } = {};

    // Asumiendo que las listas tienen la misma longitud
    for (let i = 0; i < listaClaves.length; i++) {
        resultado[listaClaves[i]] = listaValores[i];
    }

    return resultado;
}
interface Address {
    regions: {
        code: string;
        text: string;
    };
    communes: {
        code: string;
        text: string;
    };
    addresss: {
        text: string;
    };
}
const regiones = {
    Aysén: 'CL-AI',
    Antofagasta: 'CL-AN',
    'Arica y Parinacota': 'CL-AP',
    Atacama: 'CL-AT',
    Biobío: 'CL-BI',
    Coquimbo: 'CL-CO',
    'La Araucanía': 'CL-AR',
    "Libertador B. O'Higgins": 'CL-LI',
    'Los Lagos': 'CL-LL',
    'Los Ríos': 'CL-LR',
    Magallanes: 'CL-MA',
    Maule: 'CL-ML',
    'Metropolitana de Santiago': 'CL-RM',
    Tarapacá: 'CL-TA',
    Valparaíso: 'CL-VS'
};
export const processPageProfessional = async (urls: string) => {
    const resultados = [];
    try {
        console.log(urls, 'url');
        try {
            const response = await axios.get(urls);
            const html = response.data;
            const $ = cheerio.load(html);
            const pathfoto = 'https://';
            const siteId = $(
                'div[itemtype="http://schema.org/Physician"]'
            ).attr('data-eecommerce-id');
            const name = cleanText(
                $(
                    'div.unified-doctor-header-info__name span[itemprop="name"]'
                ).text()
            );
            console.log(name, 'name');
            let foto_perfil = $(
                'div.pr-1 div[data-image-gallery="true"] a'
            ).attr('href');
            if (foto_perfil === undefined) {
                foto_perfil = '';
            }

            const especialidad = cleanText(
                $('span[data-test-id="doctor-specializations"]')
                    .text()
                    .replace(/,[^,]*/g, '')
            );
            // console.log(especialidad, 'especialidad');
            const educacionList = [];
            let educacion = $(
                'div#data-type-school ul.list-unstyled.text-list li'
            );
            if (educacion.length > 1) {
                educacion.each(function () {
                    const texto = cleanText($(this).text());
                    educacionList.push(texto);
                });
            } else if (educacion.length == 0) {
                $(
                    'div[data-test-id="doctor-exp-school"] div[class="media-body"] ul[class="text-muted pl-2"]'
                )
                    .first()
                    .each(function () {
                        const texto = $(this).text().trim();
                        educacionList.push(texto);
                    });
            }
            const experienciaList = [];
            let experiencia = $(
                'div#data-type-practice ul.list-unstyled.text-list li'
            );
            if (experiencia.length > 1) {
                experiencia.each(function () {
                    const texto = cleanText($(this).text());
                    experienciaList.push(texto);
                });
            } else if (experiencia.length == 0) {
                $(
                    'div[data-test-id="doctor-exp-practice"] div[class="media-body"] ul[class="text-muted pl-2"]'
                )
                    .first()
                    .each(function () {
                        const texto = cleanText($(this).text());
                        experienciaList.push(texto);
                    });
            }
            const fotosSet = new Set();
            $(
                'div[data-test-id="doctor-exp-photo"] div[class="media-body"] ul[class="list-unstyled clearfix"] li a'
            ).each(function () {
                const texto = $(this).attr('href');
                const pathfototexto = pathfoto + texto;
                fotosSet.add(pathfototexto);
            });
            const grupo_edad_atentida = cleanText(
                $(
                    'div[data-test-id="doctor-address-allowed-patients"] div.media-body.text-muted span'
                )
                    .first()
                    .text()
            );
            const pagoList = new Set();
            let pago = $(
                'div[data-id="address-82185-payments"] div.modal-body.p-0 div.p-2 span'
            );
            if (pago.length >= 1) {
                pago.each(function () {
                    const texto = cleanText($(this).text());
                    pagoList.add(texto);
                });
            } else if (pago.length == 0) {
                $(
                    'div[data-test-id="payment-info"] div.media-body.text-muted span'
                ).each(function () {
                    const texto = cleanText($(this).text());
                    pagoList.add(texto);
                });
            }
            const numList = [];
            $('div.media.m-0 div.mr-1 div[class="modal fade"]').each(
                function () {
                    const regex = /-(\d+)-\d+-phone/;
                    const num = $(this).attr('data-id');
                    const matches = num.match(regex);
                    const phoneNumber = matches ? matches[1] : null;
                    numList.push(phoneNumber);
                }
            );
            const enfermedadesValorList = [];
            $('div#data-type-disease ul.list-unstyled.text-list li').each(
                function () {
                    const enfermedad = $(this).text().trim();
                    enfermedadesValorList.push(enfermedad);
                }
            );
            const enfermedadesclaveList = [];
            $('div#data-type-disease ul.list-unstyled.text-list li a').each(
                function () {
                    const regex = /^\/([^\/]+)\/([^\/]+)\/([^\/]+)$/;
                    const enfermedad = $(this).attr('href');
                    const matches = enfermedad.match(regex)[2];
                    enfermedadesclaveList.push(matches);
                }
            );
            const descripicon = cleanText(
                $('div[data-id="doctor-items-modals"] p').text()
            );
            if (descripicon.length == 0) {
                cleanText(
                    $(
                        'div[data-id="doctor-experience-item"] div[class="text-muted"] p'
                    ).text()
                );
            }

            const serviciosList = new Set();
            $('div[data-test-id="address-services-modal-service-item"]').each(
                function () {
                    const name = cleanText(
                        $(this)
                            .find('.text-body')
                            .text()
                            .replace(
                                /(Saber más|Desde|• Consultar valores)\s*/g,
                                ''
                            )
                    );
                    const price = cleanPrice(
                        $(this).find('[data-id="service-price"]').text()
                    );
                    const numberPrice = parseInt(price);
                    const description = cleanText(
                        $(this)
                            .find('[data-dp-expander-auto-start-slice="200"]')
                            .text()
                    );

                    serviciosList.add({
                        name,
                        numberPrice,
                        description
                    });
                }
            );
            // console.log(serviciosList, 'list');
            // a[data-online-only="false"]

            const addresList: Address[] = [];

            $('div[data-test-id="address-info"]').each(function () {
                const region = $(this)
                    .find('span[class="province region"]')
                    .attr('content');
                const comuna = $('div[data-test-id="address-info"]')
                    .find('span[class="city"]')
                    .attr('content');
                console.log(comuna, 'comuna');
                const street = $(this)
                    .find('span[data-test-id="address-info-street"]')
                    .text();
                const exampleAddress: Address = {
                    regions: {
                        code: 'region_code',
                        text: region
                    },
                    communes: {
                        code: 'commune_code',
                        text: comuna
                    },
                    addresss: {
                        text: street
                    }
                };
                let codigo;
                for (const re in regiones) {
                    if (region.includes(re)) {
                        codigo = regiones[re];
                    }
                }
                console.log(codigo);
                addresList.push(exampleAddress);
            });
            console.log(addresList, 'addres');

            const fotosArray: unknown[] = [...fotosSet];
            const pagoArray: unknown[] = [...pagoList];
            const servicioArray: unknown[] = [...serviciosList];
            const objectclavevalor = listToObject(
                enfermedadesclaveList,
                enfermedadesValorList
            );
            resultados.push({
                name: name,
                group_age: textToList(grupo_edad_atentida),
                Especiality: especialidad,
                photo_profile: pathfoto + foto_perfil,
                address: addresList,
                vocational_training: educacionList,
                experience: experienciaList,
                photo: fotosArray,
                payment_method: pagoArray,
                cell_phone: numList,
                diseases: objectclavevalor,
                description: descripicon,
                services: servicioArray,
                siteId: siteId
            });
        } catch (error) {
            console.error(
                `Error en la solicitud para ${urls}: ${error.message}`
            );
        }

        return resultados;
    } catch (e) {
        console.error(`${e}`);
        return [];
    }
};

export const processPageP = async (resultsUrl: string[]) => {
    let results = [];
    try {
        const { results: resultList, errors } =
            await PromisePool.withConcurrency(20)
                .for(resultsUrl)
                .process(async (url) => {
                    return await processPageProfessional(url);
                });
        if (errors.length) {
            console.log({ errors });
            throw new Error('ERROR_FAILED_SCRAPER');
        }
        const flatresult = resultList.flat();
        if (!flatresult.length) {
        }
        results = results.concat(flatresult);
    } catch (error) {
        console.error('Otro error:', error.message);
    }

    return results;
};
