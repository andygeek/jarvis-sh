import * as fs from 'fs';
import * as path from 'path';

export function loadCustomCommandsContent(): string {
  try {
    const filePath = path.resolve(__dirname, '../../customCommands.json'); // Ajusta la ruta según sea necesario
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
