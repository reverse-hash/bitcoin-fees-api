import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import https from 'https';
import estimatedFees from './estimated-fees.js';
import { getStatus } from './health.js';

var privateKey = fs.readFileSync('./ssl/privatekey.pem');
var certificate = fs.readFileSync('./ssl/certificate.pem');

const app = express();

https
  .createServer(
    {
      key: privateKey,
      cert: certificate,
    },
    app,
  )
  .listen(process.env.PORT);

app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

app.get('/estimated-fees', (_, res) => {
  res.send(estimatedFees());
});

app.get('/health', (_, res) => {
  return res.json({ status: getStatus() });
});
