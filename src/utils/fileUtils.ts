import * as fs from 'fs';
import * as path from 'path';

export async function concatenateFileContents(
  filePaths: string[],
): Promise<string> {
  try {
    const fileContents = await Promise.all(
      filePaths.map((filePath) => fs.promises.readFile(filePath, 'utf-8')),
    );
    return fileContents.join('\n');
  } catch (error) {
    console.error('Error reading files:', error);
    throw new Error('Failed to concatenate file contents');
  }
}

export async function createFileInTargetFolder(
  targetFolder: string,
  fileName: string,
  content: string,
): Promise<void> {
  try {
    const filePath = path.join(targetFolder, fileName);
    await fs.promises.mkdir(targetFolder, { recursive: true });
    await fs.promises.writeFile(filePath, content, 'utf-8');
    console.log(`File ${fileName} created successfully in ${targetFolder}`);
  } catch (error) {
    console.error('Error creating file:', error);
    throw new Error('Failed to create file in target folder');
  }
}

export async function createOrUpdateFile(
  filePath: string,
  content: string,
): Promise<void> {
  try {
    await fs.promises.writeFile(filePath, content, 'utf-8');
    console.log(`File ${filePath} updated successfully`);
  } catch (error) {
    console.error('Error writing to file:', error);
    throw new Error('Failed to write or update file');
  }
}
