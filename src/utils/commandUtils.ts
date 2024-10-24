import { spawnSync, spawn } from 'child_process';
import * as fs from 'fs';
import os from 'os';
import * as path from 'path';
import inquirer from 'inquirer';

const projectDir = path.join(os.homedir(), '.jarvissh');

if (!fs.existsSync(projectDir)) {
  fs.mkdirSync(projectDir);
}

const COMMANDS_PATH = path.join(projectDir, 'jarvissh_commands.txt');

export function openEditor() {
  const editor = process.env.EDITOR || 'nano';
  if (!fs.existsSync(COMMANDS_PATH)) {
    fs.writeFileSync(COMMANDS_PATH, '');
  }
  const result = spawnSync(editor, [COMMANDS_PATH], { stdio: 'inherit' });
  if (result.error) {
    console.error('Error opening the editor:', result.error);
  }
}

export function loadCustomCommandsContent(): string {
  try {
    if (!fs.existsSync(COMMANDS_PATH)) {
      fs.writeFileSync(COMMANDS_PATH, '');
    }
    const fileContent = fs.readFileSync(COMMANDS_PATH, 'utf-8');
    return fileContent;
  } catch (error) {
    console.error('Error loading custom commands content:', error);
    throw new Error('Failed to load custom commands content');
  }
}

export async function showCommandOptions(
  commandsList: string[],
): Promise<void> {
  commandsList.push('None');
  const { selectedCommand } = await inquirer.prompt<{
    selectedCommand: string;
  }>([
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
  return new Promise(() => {
    const [cmd, ...args] = command.split(' ');
    console.log(`Executing command: ${command}`);

    spawn(cmd, args, { stdio: 'inherit' });
  });
}
