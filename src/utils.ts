import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import os from 'os';
import path from 'path';
import inquirer from 'inquirer';
import ollama from 'ollama';

const projectDir = path.join(os.homedir(), '.jarvissh');

if (!fs.existsSync(projectDir)) {
  fs.mkdirSync(projectDir);
}

const commandsFilePath = path.join(projectDir, 'jarvissh_commands.txt');
const configFilePath = path.join(projectDir, 'jarvissh_config.json');

interface Config {
  model?: string;
  service_api_key?: string;
  service?: string;
}

export function readConfig(): Config {
  if (!fs.existsSync(configFilePath)) {
    return { model: 'llama3.2' };
  }
  const configData = fs.readFileSync(configFilePath, 'utf-8');
  return JSON.parse(configData);
}

export function saveConfig(config: Config) {
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
}

export async function setModel(model: string) {
  const service = getService();

  if (service === 'ollama') {
    const modelExists = await checkModelExists(model);

    if (!modelExists) {
      console.error(`Model "${model}" does not exist in Ollama.`);
      process.exit(1);
    }
  }

  const config = readConfig();
  config.model = model;
  saveConfig(config);
  console.log(`Model set globally as: ${model}`);
}

async function checkModelExists(model: string): Promise<boolean> {
  try {
    await ollama.show({ model });
    return true;
  } catch (error) {
    return false;
  }
}

export function openEditor() {
  const editor = process.env.EDITOR || 'nano';
  if (!fs.existsSync(commandsFilePath)) {
    fs.writeFileSync(commandsFilePath, '');
  }
  const result = spawnSync(editor, [commandsFilePath], { stdio: 'inherit' });
  if (result.error) {
    console.error('Error opening the editor:', result.error);
  }
}

export function loadCustomCommandsContent(): string {
  if (!fs.existsSync(commandsFilePath)) {
    return '';
  }
  return fs.readFileSync(commandsFilePath, 'utf-8');
}

export async function showCommandOptions(commandsList: string[]) {
  commandsList.push('None');
  const { selectedCommand } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedCommand',
      message: 'Select the command you want to run:',
      choices: commandsList,
    },
  ]);
  if (selectedCommand === 'None') {
    console.log('No command will be executed.');
    process.exit(1);
  }
  await executeCommand(selectedCommand);
  process.exit(1);
}

export function executeCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    console.log(`Executing command: ${command}`);

    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('close', resolve);
    child.on('error', reject);
  });
}

export function setServiceApiKey(apiKey: string) {
  const config = readConfig();
  config.service_api_key = apiKey;
  saveConfig(config);
  console.log(`Service API key has been set.`);
}

export function getServiceApiKey(): string | null {
  const config = readConfig();
  return config.service_api_key || null;
}

export function getModel(): string | null {
  const config = readConfig();
  return config.model || null;
}

export function setService(service: string) {
  const config = readConfig();
  config.service = service;
  saveConfig(config);
  console.log(`Service has been set to: ${service}`);
}

export function getService(): string | null {
  const config = readConfig();
  return config.service || null;
}

export async function concatenateFileContents(
  contextFiles: string[],
): Promise<string> {
  let result = '';

  for (const filePath of contextFiles) {
    try {
      const fileContent = await fsPromises.readFile(filePath, 'utf-8');
      result += `path: '${filePath}'\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
    } catch (error) {
      console.error(`Error reading file: ${filePath}`, error);
    }
  }

  return result.trim();
}

export async function createFileInTargetFolder(
  targetFolder: string,
  name: string,
  code: string,
) {
  try {
    await fsPromises.mkdir(targetFolder, { recursive: true });
    const filePath = path.join(targetFolder, name);
    await fsPromises.writeFile(filePath, code, 'utf-8');
    console.log(`File created: ${filePath}`);
  } catch (error) {
    console.error('Error creating file:', error);
  }
}

export async function createOrUpdateFile(filePath: string, code: string) {
  try {
    const targetFolder = path.dirname(filePath);
    await fsPromises.mkdir(targetFolder, { recursive: true });
    await fsPromises.writeFile(filePath, code, 'utf-8');
    console.log(`File created or updated: ${filePath}`);
  } catch (error) {
    console.error('Error creating or updating file:', error);
  }
}
