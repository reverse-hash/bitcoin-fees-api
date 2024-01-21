import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import https from 'https';

import estimatedFees from './estimated-fees.js';
import { health } from './health.js';

const key = fs.readFileSync('./ssl/domain.key'); // Domain private key
const cert = fs.readFileSync('./ssl/domain.crt'); // Domain certificate
const ca = fs.readFileSync('./ssl/ca.crt'); // Authority certificate

const app = express();
app.use(cors());
app.get('/estimated-fees', (_, res) => res.send(estimatedFees()));
app.get('/health', (_, res) => res.json(health()));

const options = { key, cert, ca };
https.createServer(options, app).listen(process.env.PORT);
