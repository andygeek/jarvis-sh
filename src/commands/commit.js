import { execSync, exec } from 'child_process';
import readline from 'readline';
import chalk from 'chalk';
import { getService } from '../utils.js';

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

/**
 * Function to load the appropriate service functions based on the current configuration.
 * 
 * @returns {Object} - Returns an object containing the appropriate `askModelJson` function.
 */
async function loadServiceFunctions() {
  const service = getService();  // Retrieve the service from utils (e.g., 'ollama' or 'openai')

  if (service === 'openai') {
    const { askModelJson } = await import('../clients/openai.js');
    return { askModelJson };
  } else if (service === 'ollama') {
    const { askModelJson } = await import('../clients/ollama.js');
    return { askModelJson };
  } else {
    throw new Error(`Unknown service: ${service}`);
  }
}

/**
 * Function to generate a commit message based on the staged Git diff and the model's response.
 * 
 * @returns {Promise<{title: string, description: string} | false>} - A JSON with the title and description using conventional commits, or false if the process fails.
 */
export async function generateCommitMessage() {
  const diff = await getStagedDiff();
  
  if (!diff) {
    console.log('There are no staged changes to commit.');
    return false;
  }

  const message = `
  Conventional Commits is a specification for writing consistent and meaningful commit messages. The structure of a conventional commit is as follows:
  
  <type>: <short description>
  
  - **type**: Specifies the category of the change. Common types are:
    - 'feat': A new feature
    - 'fix': A bug fix
    - 'chore': Routine tasks or maintenance
    - 'refactor': Code changes that don't affect functionality
    - 'docs': Documentation-only changes
    - 'test': Adding or updating tests
    - 'style': Code style changes (e.g., formatting)
  
  ---
  
  Use the following git diff and give me the title and short description for the commit using conventional commits. The description must have a maximum of 30 words in English:
  
  ${diff}
  
  Give me a JSON with only the title and description using conventional commits`.trim();

  const { askModelJson } = await loadServiceFunctions();

  const response = await askModelJson({
    messages: [{ role: 'user', content: message }],
  });

  if (!response) {
    console.error('Error generating the commit message.');
    return false;
  }

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
