import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const projectDir = path.join(os.homedir(), '.jarvissh');

if (!fs.existsSync(projectDir)) {
  fs.mkdirSync(projectDir);
}

const CONFIG_PATH = path.join(projectDir, 'jarvissh_config.json');

export async function saveConfig(config: any): Promise<void> {
  try {
    await fs.ensureDir(path.dirname(CONFIG_PATH));
    await fs.writeJson(CONFIG_PATH, config, { spaces: 2 });
    console.log('Configuration saved successfully.');
  } catch (err) {
    console.error('Error saving config:', err);
  }
}

export async function loadConfig(): Promise<any> {
  try {
    if (await fs.pathExists(CONFIG_PATH)) {
      const config = await fs.readJson(CONFIG_PATH);
      return config;
    } else {
      console.error('Configuration file not found.');
      return null;
    }
  } catch (err) {
    console.error('Error loading config:', err);
    throw err;
  }
}

export async function showConfig() {
  try {
    if (await fs.pathExists(CONFIG_PATH)) {
      const configData = await fs.readJson(CONFIG_PATH);
      console.log(
        'Current Configuration:',
        JSON.stringify(configData, null, 2),
      );
    } else {
      console.log('No configuration found.');
    }
  } catch (err) {
    console.error('Error showing config:', err);
  }
}
