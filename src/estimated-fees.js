import { RPCClient } from 'rpc-bitcoin';
import { setStatus } from './health.js';

const LESS_THAN_20MIN_HEIGHT = 2;
const LESS_THAN_1H_HEIGHT = 5;
const LESS_THAN_6H_HEIGHT = 35;
const LESS_THAN_24H_HEIGHT = 143;

const URL = 'http://' + process.env.BITCOIND_HOST;
const USER = process.env.BITCOIND_RPC_USER;
const PASS = process.env.BITCOIND_RPC_PASS;
const PORT = process.env.BITCOIND_PORT;
const TIMEOUT = 10000;

console.log('Connecting to ' + JSON.stringify({ URL, PORT, USER }));

const CLIENT = new RPCClient({ url: URL, port: PORT, timeout: TIMEOUT, user: USER, pass: PASS });

const DEFAULT_VALUE = {
  level: 'unknown',
  lessThan20min: null,
  lessThan1hour: null,
  lessThan6hours: null,
  lessThan24hours: null,
};

let estimatedFees = DEFAULT_VALUE;

function estimateSmartFee(height) {
  return new Promise((resolve, reject) => {
    const conf_target = height;
    const estimate_mode = 'ECONOMICAL';
    CLIENT.estimatesmartfee({ conf_target, estimate_mode })
      .then((res) => resolve(Math.round((res.feerate * 100000000) / 1024)))
      .catch((err) => reject(err));
  });
}

function getLevel(fee) {
  return fee <= process.env.LOW_FEE_THRESHOLD ? 'low' : fee <= process.env.MEDIUM_FEE_THRESHOLD ? 'medium' : 'high';
}

async function executePeriodically() {
  let attempts = 0;

  while (true) {
    try {
      const lessThan20min = await estimateSmartFee(LESS_THAN_20MIN_HEIGHT);
      const lessThan1hour = await estimateSmartFee(LESS_THAN_1H_HEIGHT);
      const lessThan6hours = await estimateSmartFee(LESS_THAN_6H_HEIGHT);
      const lessThan24hours = await estimateSmartFee(LESS_THAN_24H_HEIGHT);
      const level = getLevel(lessThan20min);

      estimatedFees = {
        level,
        lessThan20min,
        lessThan1hour,
        lessThan6hours,
        lessThan24hours,
      };

      console.log(estimatedFees);

      attempts = 0;
      const waitTime = process.env.UPDATE_FEE_INTERVAL;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    } catch (error) {
      console.error(`Error in execution (Attempt ${attempts + 1}): ${JSON.stringify(error)}`);

      let waitTime = 0;
      if (attempts === 0) {
        waitTime = 20 * 1000; // 20 seconds;
      } else if (attempts === 1) {
        waitTime = 60 * 1000; // 1 minute
      } else if (attempts === 2) {
        waitTime = 10 * 60 * 1000; // 10 minutes
      } else if (attempts === 2) {
        waitTime = 30 * 60 * 1000; // 30 minutes
      } else {
        setStatus('error');
        estimatedFees = DEFAULT_VALUE;
        break;
      }

      attempts++;

      console.log(`Retrying in ${waitTime / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

executePeriodically();

export default () => estimatedFees;
