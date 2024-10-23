import { spawnSync } from 'child_process';
import * as fs from 'fs';
import os from 'os';
import * as path from 'path';

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
    const filePath = path.resolve(__dirname, '../../customCommands.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return fileContent;
  } catch (error) {
    console.error('Error loading custom commands content:', error);
    throw new Error('Failed to load custom commands content');
  }
}

export async function showCommandOptions(
  commandsList: string[],
): Promise<void> {
  if (commandsList.length === 0) {
    console.log('No commands available');
    return;
  }

  console.log('Available commands:');
  commandsList.forEach((command, index) => {
    console.log(`${index + 1}. ${command}`);
  });
}
