import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import https from 'https';
import estimatedFees from './estimated-fees.js';

var privateKey = fs.readFileSync('./ssl/privatekey.pem');
var certificate = fs.readFileSync('./ssl/certificate.pem');

const app = express();

const options = {
  key: privateKey,
  cert: certificate,
};

app.use(cors());

app.get('/estimated-fees', (_, res) => {
  res.send(estimatedFees());
});

app.get('/health', (_, res) => {
  return res.json(health());
});

https.createServer(options, app).listen(process.env.PORT);
