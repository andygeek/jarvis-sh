import { exec, spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import inquirer from 'inquirer';
import ollama from 'ollama';

// Define the project directory path within the user's home directory
const projectDir = path.join(os.homedir(), '.jarvissh');

// Check if the project directory exists. If it does not, create it.
if (!fs.existsSync(projectDir)) {
  fs.mkdirSync(projectDir);
}

// Define the file path for storing commands and configuration inside the project directory.
const commandsFilePath = path.join(projectDir, 'jarvissh_commands.txt');
const configFilePath = path.join(projectDir, 'jarvissh_config.json');

/**
 * Function to read the global configuration from a file.
 * 
 * @returns {Object} - The configuration object, with at least the `model` property.
 *                     If the config file does not exist, it returns a default config 
 *                     with the model set to 'llama3.2'.
 */
export function readConfig() {
  if (!fs.existsSync(configFilePath)) {
    return { model: 'llama3.2' };
  }
  const configData = fs.readFileSync(configFilePath, 'utf-8');
  return JSON.parse(configData);
}

/**
 * Function to save the global configuration to a file.
 * 
 * @param {Object} config - The configuration object to be saved.
 */
export function saveConfig(config) {
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
}

/**
 * Asynchronous function to set a model globally after verifying its existence in Ollama.
 * 
 * @param {string} model - The name of the model to set.
 */
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

/**
 * Asynchronous function to check if a specific model exists and is installed in Ollama.
 * 
 * @param {string} model - The name of the model to check.
 * @returns {Promise<boolean>} - Returns `true` if the model exists and is installed, 
 *                               otherwise returns `false`.
 */
async function checkModelExists(model) {
  try {
    await ollama.show({ model });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Function to open the commands file in a text editor.
 * 
 * This function checks the `EDITOR` environment variable to determine the preferred editor, 
 * defaulting to `nano` if none is set. If the commands file does not exist, it creates an 
 * empty file. Then, it opens the file in the specified editor. Any errors while opening the editor
 * are logged to the console.
 */
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

/**
 * Function to load the content of the custom commands file.
 * 
 * @returns {string} - The content of the commands file as a string. 
 *                     If the file does not exist, it returns an empty string.
 * 
 * This function reads and returns the contents of `commandsFilePath`. 
 * If the file is missing, it returns an empty string instead.
 */
export function loadCustomCommandsContent() {
  if (!fs.existsSync(commandsFilePath)) {
    return '';
  }
  return fs.readFileSync(commandsFilePath, 'utf-8');
}

/**
 * Function to display a list of command options and allow the user to select one.
 * 
 * @param {string[]} commandsList - An array of command strings for the user to choose from.
 * 
 * This function uses `inquirer` to prompt the user with a list of commands. 
 * An additional "None" option is appended to the list, allowing the user to choose not to execute any command. 
 * If a command is selected, `executeCommand` is called to run it. If "None" is chosen, it logs a message and exits.
 */
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

/**
 * Function to execute a shell command and display its output.
 * 
 * @param {string} command - The shell command to be executed.
 * @returns {Promise<string>} - Resolves with the command's output, or rejects if an error occurs.
 * 
 * This function uses `exec` to run the specified command asynchronously. 
 */
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
