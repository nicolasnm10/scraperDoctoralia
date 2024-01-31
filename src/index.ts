import express from 'express';
import { Scraper } from './scraperBase/scraper';
import { processPageProfessional } from './scraperProfessional/scraper_profesional';
// import { processPageProfessionalPrice } from './scraperProfessional/scraper_price';
const app = express();
const PORT = 3000;

require('dotenv').config();

const indexRouter = express.Router();

// Ruta de ejemplo
indexRouter.get('/', (_req, res) => {
    res.json({ message: '¡Bienvenido a mi API!' });
});

indexRouter.get('/scraper', async (_req, res) => {
    res.json(await Scraper());
});
indexRouter.get('/professional', async (_req, res) => {
    res.json(await processPageProfessional());
    // res.json({ message: 'holi' });
});
// indexRouter.get('/professional_price', async (_req, res) => {
//     res.json(await processPageProfessionalPrice());
//     // res.json({ message: 'holi' });
// });

app.use('/api', indexRouter);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
