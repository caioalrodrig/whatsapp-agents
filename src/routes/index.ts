import { Router } from 'express';
import { webhook } from '../webhooks/index.js';
import { filterInputData } from '../service/filter/filterInput.js';
import { formatInputData } from '@/service/filter/formatInput.js';

const router = Router();

router.post('/webhook/evolution', formatInputData, filterInputData, webhook);

export { router };
