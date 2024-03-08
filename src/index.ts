import express from 'express';
import { Scraper } from './scraperBase/scraper';
import { getListEspeciality } from './scraperEspecialty/scaper_especiality';
const app = express();
const PORT = 3000;

require('dotenv').config();

const indexRouter = express.Router();
app.use(express.json());

// Ruta de ejemplo
indexRouter.get('/', (_req, res) => {
    res.json({ message: '¡Bienvenido a mi API!' });
});

indexRouter.post('/scraper', (req, res) => {
    const {
        webhook = null,
        web = 'doctoralia',
        category = 'kinesiologo'
    } = req.body;
    console.log(webhook);
    const status = Scraper(webhook, web, category);
    res.json({ ok: status });
});
indexRouter.get('/scraper/especiality', async (_req, res) => {
    const result = await getListEspeciality();
    console.log('result:', result);
    res.json(result);
});

app.use('/api', indexRouter);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
