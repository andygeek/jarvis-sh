import { execSync, exec } from 'child_process';
import readline from 'readline';
import chalk from 'chalk';
import { commitMessage } from '../messages/commitMessages.js';
import { MultiLlama, Pipeline } from 'multillama';

/**
 * Function to get the staged diff in the Git repository.
 * 
 * @returns {string | null} - The Git diff of staged changes as a string, or null if an error occurs.
 */
async function getStagedDiff() {
  try {
    const diff = execSync('git diff --staged').toString();
    return diff;
  } catch (error) {
    console.error('Error retrieving the diff:', error);
    return null;
  }
}

export async function generateCommitMessage(model) {
  const multillama = new MultiLlama();

  const diff = await getStagedDiff();
  const message = commitMessage(diff);

  const pipeline = new Pipeline();

  pipeline.setEnableLogging(false);

  pipeline.addStep(async (response) => {
    return await multillama.useModel(model, [{role: 'user', content: response}]);
  });
  const response = await pipeline.execute(message);
  const { title, description } = JSON.parse(response);
  return { title, description };
}

/**
 * Function to prompt the user if they want to proceed with the commit and perform the commit if confirmed.
 * 
 * @param {string} title - The commit title.
 * @param {string} description - The commit description.
 */
export function askCommitConfirmationAndExecute(title, description) {
  console.log(`\nCommit message generated:`);
  console.log(`${chalk.green('Title:')} ${title}`);
  console.log(`${chalk.green('Description:')} ${description}`);
  console.log(`Do you want to commit with this message? ${chalk.green('(y/n)')}`);

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
      console.log("Commit canceled.");
    }
    rl.close();
  });
}
