// const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
// const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

// const app = express();
// app.use(cors());
// app.use(express.json());

// Configuration
const CONFIG = {
  apiUrl: 'http://s.padbot.cn:9080/cloud/openapirobot/applyRobotMqttInfo.action',
  appkey: process.env.APPKEY,
  apptoken: process.env.APPTOKEN,
  port: process.env.PORT || 3001,
  outputFile: 'robot-mqtt-credentials.json'
};

/**
 * Generate MD5 signature for API authentication following the robot API specification
 * 
 * Algorithm:
 * Step 1: Sort business parameters in ascending order and concatenate as param1:val1,param2:val2,...
 * Step 2: Append time, appkey, and apptoken
 * Step 3: Calculate MD5 hash and convert to lowercase hex string
 * 
 * Format: param1:val1,param2:val2,...,time:val,appkey:val,apptoken:val
 */
function generateSign(businessParams, appkey, apptoken, time) {
  // Step 1: Sort business parameters by key in ascending order
  const sortedKeys = Object.keys(businessParams).sort();
  const paramPairs = sortedKeys.map(key => `${key}:${businessParams[key]}`);
  
  // Step 2: Build signature string with params, time, appkey, apptoken
  const signParts = [
    ...paramPairs,
    `time:${time}`,
    `appkey:${appkey}`,
    `apptoken:${apptoken}`
  ];
  
  const signatureString = signParts.join(',');
  console.log('Signature string:', signatureString);
  
  // Step 3: Calculate MD5 and convert to lowercase hex
  const sign = crypto.createHash('md5').update(signatureString).digest('hex');
  return sign;
}

/**
 * Fetch MQTT credentials from robot API and save to JSON file
 */
async function fetchAndSaveCredentials(businessParams = {}) {
  try {
    const time = Math.floor(Date.now() / 1000);
    const sign = generateSign(businessParams, CONFIG.appkey, CONFIG.apptoken, time);

    const requestData = {
      system: {
        time: time,
        appkey: CONFIG.appkey,
        language: 'zh-CN',
        sign: sign
      },
      ...businessParams
    };

    console.log('📡 Fetching MQTT credentials from robot API...');
    console.log('Request:', JSON.stringify(requestData, null, 2));
    
    const response = await axios.post(CONFIG.apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      }
    });

    console.log('✅ Response received');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.messageCode !== 10000) {
      throw new Error(`API returned error code: ${response.data.messageCode}`);
    }

    const outputPath = path.join(__dirname, CONFIG.outputFile);
    await fs.writeFile(outputPath, JSON.stringify(response.data, null, 2));
    console.log(`\n💾 Response saved to: ${outputPath}`);

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching credentials:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

fetchAndSaveCredentials();
