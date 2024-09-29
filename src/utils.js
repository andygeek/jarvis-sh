import { exec, spawnSync } from 'child_process';
import fs from 'fs';
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

export function readConfig() {
  if (!fs.existsSync(configFilePath)) {
    return { model: 'llama3.2' };
  }
  const configData = fs.readFileSync(configFilePath, 'utf-8');
  return JSON.parse(configData);
}

export function saveConfig(config) {
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
}

export async function setModel(model) {
  const modelExists = await checkModelExists(model);

  if (!modelExists) {
    console.error(`Model "${model}" does not exist.`);
    process.exit(1);
  }

  const config = readConfig();
  config.model = model;
  saveConfig(config);
  console.log(`Model set globally as: ${model}`);
}

async function checkModelExists(model) {
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

export function loadCustomCommandsContent() {
  if (!fs.existsSync(commandsFilePath)) {
    return '';
  }
  return fs.readFileSync(commandsFilePath, 'utf-8');
}

export async function showCommandOptions(commandsList) {
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
    return;
  }
  await executeCommand(selectedCommand);
}

export function executeCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Executing command: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Error: ${stderr}`);
      }
      console.log(`Output: ${stdout}`);
      resolve(stdout);
    });
  });
}
