import { Router } from 'express';
import { webhook } from '../webhooks/index.js';

const router = Router();

router.post('/webhook/evolution', webhook);

export { router };
