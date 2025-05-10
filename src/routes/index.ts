import { Router } from 'express';
import { webhook } from '../webhooks/index.js';
import { filterInputData } from '../service/filter/filterInputData.js';

const router = Router();

router.post('/webhook/evolution', filterInputData, webhook);

export { router };
