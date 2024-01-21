import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import https from 'https';
import estimatedFees from './estimated-fees.js';
import { getStatus } from './health.js';

var privateKey = fs.readFileSync('./ssl/privatekey.pem');
var certificate = fs.readFileSync('./ssl/certificate.pem');

const app = express();

const options = {
  key: privateKey,
  cert: certificate,
};

app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With, X-Api-Key',
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.get('/estimated-fees', (_, res) => {
  res.send(estimatedFees());
});

app.get('/health', (_, res) => {
  return res.json({ status: getStatus() });
});

https.createServer(options, app).listen(process.env.PORT);
