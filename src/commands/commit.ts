import { execSync, exec } from 'child_process';
import readline from 'readline';
import chalk from 'chalk';
import { commitMessage } from '../messages/commitMessages.js';
import { MultiLlama, Pipeline } from 'multillama';

interface CommitData {
  title: string;
  description: string;
}

async function getStagedDiff(): Promise<string | null> {
  try {
    const diff = execSync('git diff --staged').toString();
    return diff;
  } catch (error) {
    console.error('Error retrieving the diff:', error);
    return null;
  }
}

export async function generateCommitMessage(
  model: string,
): Promise<CommitData | null> {
  const multillama = new MultiLlama();

  const diff = await getStagedDiff();
  if (!diff) return null;

  const message = commitMessage(diff);

  const pipeline = new Pipeline<string>();

  pipeline.setEnableLogging(false);

  pipeline.addStep(async (response) => {
    return await multillama.useModel(model, [
      { role: 'user', content: response },
    ]);
  });
  const response = await pipeline.execute(message);
  const { title, description } = JSON.parse(response);
  return { title, description };
}

/**
 * Function to prompt the user if they want to proceed with the commit and perform the commit if confirmed.
 */
export function askCommitConfirmationAndExecute(
  title: string,
  description: string,
) {
  console.log(`\nCommit message generated:`);
  console.log(`${chalk.green('Title:')} ${title}`);
  console.log(`${chalk.green('Description:')} ${description}`);
  console.log(
    `Do you want to commit with this message? ${chalk.green('(y/n)')}`,
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('', (answer) => {
    if (answer.toLowerCase() === 'y') {
      const commitMessage = `${title}\n\n${description}`;
      exec(`git commit -m "${commitMessage}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error committing: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log(`Commit completed: ${stdout}`);
      });
    } else {
      console.log('Commit canceled.');
    }
    rl.close();
  });
}
