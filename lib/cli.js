#!/usr/bin/env node

import { getConfig, saveConfig, deleteConfig, CONFIG_FILE_PATH } from './config.js';
import { healthCheck } from './api.js';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'status': {
      const config = getConfig();
      if (!config) {
        console.log('Not configured. Run: 10x-n8n connect');
        process.exit(1);
      }
      console.log(`Mode: ${config.mode}`);
      console.log(`URL:  ${config.baseUrl}`);
      console.log(`Label: ${config.label || 'N/A'}`);
      console.log('\nChecking connection...');
      const result = await healthCheck();
      if (result.ok) {
        console.log('Connected successfully.');
      } else {
        console.log(`Connection failed: ${result.error}`);
        process.exit(1);
      }
      break;
    }

    case 'connect': {
      const mode = args[1]; // cloud or self-hosted
      const baseUrl = args[2];
      const apiKey = args[3];
      const label = args[4] || '';

      if (!mode || !baseUrl || !apiKey) {
        console.log('Usage: 10x-n8n connect <mode> <baseUrl> <apiKey> [label]');
        console.log('  mode: cloud | self-hosted');
        console.log('  baseUrl: https://your-instance.app.n8n.cloud or http://localhost:5678');
        console.log('  apiKey: Your n8n API key');
        process.exit(1);
      }

      saveConfig({ mode, baseUrl: baseUrl.replace(/\/$/, ''), apiKey, label });
      console.log(`Configuration saved to ${CONFIG_FILE_PATH}`);

      const result = await healthCheck();
      if (result.ok) {
        console.log('Connection verified successfully.');
      } else {
        console.log(`Warning: Connection test failed: ${result.error}`);
        console.log('Config saved anyway. Check your URL and API key.');
      }
      break;
    }

    case 'disconnect': {
      deleteConfig();
      console.log('n8n configuration removed.');
      break;
    }

    case 'config': {
      const config = getConfig();
      if (!config) {
        console.log('Not configured. Run: 10x-n8n connect');
      } else {
        console.log(JSON.stringify(config, null, 2));
      }
      break;
    }

    default:
      console.log('10x-n8n — Claude Code skill for n8n');
      console.log('');
      console.log('Commands:');
      console.log('  connect <mode> <url> <apiKey> [label]  Connect to n8n instance');
      console.log('  disconnect                              Remove connection config');
      console.log('  status                                  Check connection health');
      console.log('  config                                  Show current config');
      break;
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
