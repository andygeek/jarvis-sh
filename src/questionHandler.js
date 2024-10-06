import { askModel, askModelStream } from './clients/ollama.js';
import { loadCustomCommandsContent, showCommandOptions, readConfig } from './utils.js';

/**
 * Main function to handle user input, determining if it is a command or a general question.
 * 
 * @param {string} userInput - The input provided by the user.
 */
export async function handleCommandOrQuestion(userInput) {
  try {
    const isCommand = await checkIfCommand(userInput);
    if (isCommand) {
      await handleCommand(userInput);
    } else {
      await handleQuestion(userInput);
    }
  } catch (error) {
    console.error('An unexpected error occurred while processing the request:', error);
  }
}

/**
 * Function to determine if the user input represents a command.
 * 
 * @param {string} userInput - The input string from the user.
 * @returns {Promise<boolean>} - Returns `true` if the input is identified as a command, otherwise `false`.
 * 
 * This function reads the model from the config and sends a prompt to it, asking whether the input
 * is about terminal commands. It expects a JSON response with a boolean `isCommand` field. If the 
 * response is not JSON or is malformed, it defaults to `false`.
 */
async function checkIfCommand(userInput) {
  const { model } = readConfig();
  const message = `
  Is the following question about terminal commands?

  ${userInput}

  Respond with {"isCommand": true} for yes, and with {"isCommand": false} for no.`.trim();

  const response = await askModel({
    model,
    messages: [{ role: 'user', content: message }],
    format: 'json',
  });

  if (response === null) {
    return false;
  }

  try {
    const jsonResponse = JSON.parse(response);
    // console.log('Model Answer 1:\n', jsonResponse);
    return jsonResponse.isCommand || false;
  } catch (error) {
    console.error('Error parsing model response:', error);
    return false;
  }
}

/**
 * Function to handle input identified as a command.
 * 
 * @param {string} userInput - The command input from the user.
 * 
 * This function reads available custom commands and passes them to the model to identify potential 
 * commands that match the user's request. The model's response is expected in JSON format with a 
 * "commands" array. If no matching commands are found, a message is logged.
 */
async function handleCommand(userInput) {
  const { model } = readConfig();
  const customCommandsContent = loadCustomCommandsContent();
  const fullMessage = `
  Custom commands available:
  ${customCommandsContent}

  Taking that into account, respond with a JSON containing a list of commands that can solve the following request, and if no specific commands fit or if additional context is needed, you can also rely on your general knowledge to provide the best possible answer:

  ${userInput}

  JSON must be in the following format only:
  {
  "commands": ["command1", "command2", "..."]
  }
  `.trim();

  const responseContent = await askModel({
    model,
    messages: [{ role: 'user', content: fullMessage }],
    format: 'json',
  });

  if (responseContent === null) {
    return;
  }

  // console.log('Model Answer 2:\n', responseContent);
  let commandsList = [];
  try {
    const jsonResponse = JSON.parse(responseContent);
    commandsList = jsonResponse.commands || [];
  } catch (error) {
    console.error('Error parsing JSON response from model:', error);
    return;
  }

  if (commandsList.length === 0) {
    console.log('No commands found for the given request.');
    return;
  }

  await showCommandOptions(commandsList);
}

/**
 * Function to handle input identified as a general question.
 * 
 * @param {string} userInput - The question input from the user.
 * 
 * This function streams the model's response to the terminal. It uses `askModelStream`, which returns 
 * a generator that yields parts of the model's answer. The output is displayed to the user in real-time.
 */
async function handleQuestion(userInput) {
  const { model } = readConfig();
  const responseGenerator = await askModelStream({
    model,
    messages: [{ role: 'user', content: userInput }],
  });

  if (responseGenerator === null) {
    return;
  }

  for await (const part of responseGenerator) {
    process.stdout.write(part.message.content);
  }
}
