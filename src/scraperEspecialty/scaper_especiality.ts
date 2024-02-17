import cheerio from 'cheerio';
import axios from 'axios';

export const getListEspeciality = async () => {
    const url = 'https://www.doctoralia.cl/especialidades-medicas';
    const urlDoctoralia = 'https://www.doctoralia.cl';
    const resultados = [];
    try {
        const response = await axios.get(url);
        console.log({ status: response.status });
        if (response.status !== 200) {
            console.error('Error al obtener la página');
            return [];
        }
        const html = response.data;
        const $ = cheerio.load(html);
        const list_name_especiality = [];
        $(
            'section[class="card card-shadow-1 mb-1"] div[class="card-header"]'
        ).each((_index, element) => {
            const especiality_name = $(element).text().trim();
            list_name_especiality.push(especiality_name);
        });
        const list_url_especiality = [];
        $(
            'section[class="card card-shadow-1 mb-1"] div[class="card-header"] a'
        ).each((_index, element) => {
            const especiality_url = $(element).attr('href');
            list_url_especiality.push(urlDoctoralia + especiality_url);
        });
        resultados.push({
            name: list_name_especiality,
            url: list_url_especiality
        });
        return resultados;
    } catch (e) {
        console.error(`Error al obtener la página error: ${e}`);
        return [];
    }
};
