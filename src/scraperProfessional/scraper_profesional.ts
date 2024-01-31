import { Scraper } from '../scraperBase/scraper';
import cheerio from 'cheerio';
import axios from 'axios';

function cleanText(text: string): string {
    return text
        .trim()
        .replace(/\t|\n|\s{2,}/g, ' ')
        .replace(/\s+/g, ' ');
}

export const processPageProfessional = async () => {
    const resultados = [];
    try {
        const urls = await Scraper();
        console.log(urls, 'url');
        for (const url of urls) {
            try {
                const response = await axios.get(url);
                const html = response.data;
                const $ = cheerio.load(html);

                const name = cleanText(
                    $(
                        'div.unified-doctor-header-info__name span[itemprop="name"]'
                    ).text()
                );

                let foto_perfil = $(
                    'div.pr-2 div[data-image-gallery="true"] a'
                ).attr('href');
                if (foto_perfil === undefined) {
                    foto_perfil = '';
                }
                const especialidad = cleanText(
                    $(
                        'h2.h4.text-muted.font-weight-normal.mb-0-5.d-flex span.text-truncate a[title="Kinesiólogo"]'
                    ).text()
                );
                const direccion = $('h5.m-0.font-weight-normal span.text-body')
                    .map(function () {
                        return cleanText($(this).text());
                    })
                    .get();

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
                    fotosSet.add(texto);
                });
                console.log(fotosSet, 'fotos');

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
                console.log(pagoList, 'pagoList');
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

                const enfermedadesList = [];
                $('div#data-type-disease ul.list-unstyled.text-list li').each(
                    function () {
                        const enfermedad = $(this).text().trim();
                        enfermedadesList.push(enfermedad);
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
                $('div[data-test-id="profile-pricing-list-details"]').each(
                    function () {
                        // Obtener el nombre específico del elemento actual
                        const name = cleanText(
                            $(this)
                                .prev(
                                    'div[data-test-id="profile-pricing-list-element"]'
                                )
                                .find('p[itemprop="availableService"]')
                                .text()
                        );

                        const precio = cleanText(
                            $(this)
                                .find(
                                    'p[data-test-id="profile-pricing-element-price"]'
                                )
                                .text()
                        ).replace(/(Saber más|Desde)\s*/g, '');

                        const descripcion = cleanText(
                            $(this)
                                .find(
                                    'p[data-test-id="profile-pricing-element-description"]'
                                )
                                .text()
                        );

                        if (name && precio && descripcion) {
                            serviciosList.add({
                                name,
                                precio,
                                descripcion
                            });
                        }
                    }
                );
                console.log(serviciosList, 'serviciosList');
                const fotosArray: unknown[] = [...fotosSet];
                const pagoArray: unknown[] = [...pagoList];
                const servicioArray: unknown[] = [...serviciosList];

                resultados.push({
                    name: name,
                    grupo_edad_atendida: grupo_edad_atentida,
                    especialidad: especialidad,
                    foto_perfil: foto_perfil,
                    direccion: direccion,
                    educacionList: educacionList,
                    experienciaList: experienciaList,
                    fotosSet: fotosArray,
                    pagoList: pagoArray,
                    numList: numList,
                    enfermedadesList: enfermedadesList,
                    descripcion: descripicon,
                    serviciosList: servicioArray
                });
            } catch (error) {
                console.error(
                    `Error en la solicitud para ${url}: ${error.message}`
                );
            }
        }
        return resultados;
    } catch (e) {
        console.error(`${e}`);
        return [];
    }
};

// return {
//     nombre: name,
//     // especialidasd: especialidad,
//     direccion: direccion,
//     // foto_perfil: foto_perfil,
//     // descripcion: descripicon,
//     // educacion: educacion,
//     // experiencia: experienciaList,
//     // fotos: fotosSet,
//     // servicios: serviciosList,
//     grupo_edad_atendido: grupo_edad_atentida
//     // metodo_pago: pagoList,
//     // numero_contacto: numList,
//     // enfermedades: enfermedadesList
// };
