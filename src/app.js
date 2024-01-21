import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import https from 'https';

import estimatedFees from './estimated-fees.js';
import { health } from './health.js';

var key = fs.readFileSync('./ssl/domain.key'); // Domain private key
var cert = fs.readFileSync('./ssl/domain.crt'); // Domain certificate
var ca = fs.readFileSync('./ssl/ca.crt'); // Authority certificate

const app = express();

const options = { key, cert, ca };

app.use(cors());

app.get('/estimated-fees', (_, res) => {
  res.send(estimatedFees());
});

app.get('/health', (_, res) => {
  return res.json(health());
});

https.createServer(options, app).listen(process.env.PORT);
