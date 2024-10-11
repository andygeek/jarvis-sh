import { loadCustomCommandsContent, showCommandOptions, getService } from './utils.js';
import ora from 'ora';

const spinner = ora();

/**
 * Main function to handle user input, determining if it is a command or a general question.
 * 
 * @param {string} userInput - The input provided by the user.
 */
export async function handleCommandOrQuestion(userInput) {
  spinner.start('Thinking...');
  try {
    const isCommand = await checkIfCommand(userInput);
    if (isCommand) {
      await handleCommand(userInput);
    } else {
      await handleQuestion(userInput);
    }
  } catch (error) {
    spinner.succeed();
    console.error('An unexpected error occurred while processing the request:', error);
  }
}

/**
 * Function to determine if the user input represents a command.
 * 
 * @param {string} userInput - The input string from the user.
 * @returns {Promise<boolean>} - Returns `true` if the input is identified as a command, otherwise `false`.
 */
async function checkIfCommand(userInput) {
  const message = `
  Is the following question about terminal commands?

  ${userInput}

  Give me a JSON with {"isCommand": true} for yes, and with {"isCommand": false}.`.trim();

  const { askModelJson } = await loadServiceFunctions();

  const response = await askModelJson({
    messages: [{ role: 'user', content: message }],
  });

  if (response === null) {
    return false;
  }

  try {
    const jsonResponse = JSON.parse(response);
    return jsonResponse.isCommand || false;
  } catch (error) {
    spinner.succeed();
    console.error('Error parsing model response:', error);
    return false;
  }
}

/**
 * Function to handle input identified as a command.
 * 
 * @param {string} userInput - The command input from the user.
 */
async function handleCommand(userInput) {
  const customCommandsContent = loadCustomCommandsContent();
  const fullMessage = `
  Custom commands available:
  ${customCommandsContent}

  Taking that into account, respond with a JSON containing a list of commands that can solve the following request:

  ${userInput}

  Give me a JSON in the following format: 
  {
  "commands": ["command1", "command2", "..."]
  }
  `.trim();

  const { askModelJson } = await loadServiceFunctions();

  const responseContent = await askModelJson({
    messages: [{ role: 'user', content: fullMessage }],
  });

  if (responseContent === null) {
    return;
  }
  
  let commandsList = [];
  try {
    const jsonResponse = JSON.parse(responseContent);
    commandsList = jsonResponse.commands || [];
  } catch (error) {
    console.error('Error parsing JSON response from model:', error);
    return;
  }

  if (commandsList.length === 0) {
    await generateOtherCommands(userInput);
  }
  spinner.succeed();
  await showCommandOptions(commandsList);
}

/**
 * Function to handle input identified as a command.
 * 
 * @param {string} userInput - The command input from the user.
 */
async function generateOtherCommands(userInput) {
  const customCommandsContent = loadCustomCommandsContent();
  const fullMessage = `
  Respond with a JSON containing a list of commands that can solve the following request:

  ${userInput}

  Give me a JSON in the following format: 
  {
  "commands": ["command1", "command2", "..."]
  }
  `.trim();

  const { askModelJson } = await loadServiceFunctions();

  const responseContent = await askModelJson({
    messages: [{ role: 'user', content: fullMessage }],
  });

  if (responseContent === null) {
    return;
  }

  let commandsList = [];
  try {
    const jsonResponse = JSON.parse(responseContent);
    commandsList = jsonResponse.commands || [];
  } catch (error) {
    console.error('Error parsing JSON response from model:', error);
    return;
  }

  if (commandsList.length === 0) {
    spinner.succeed();
    console.log('No commands found for the given request.');
    return;
  }
  spinner.succeed();
  await showCommandOptions(commandsList);
}

/**
 * Function to handle input identified as a general question.
 * 
 * @param {string} userInput - The question input from the user.
 */
async function handleQuestion(userInput) {
  const service = getService(); 
  const { askModelStream } = await loadServiceFunctions();  // Load the streaming handler for the service

  const responseGenerator = await askModelStream({
    messages: [{ role: 'user', content: userInput }],
  });

  if (responseGenerator === null) {
    spinner.succeed();
    return;
  }

  if (service === 'ollama') {
    spinner.succeed();
    for await (const part of responseGenerator) {
      process.stdout.write(part.message.content);
    }
  } else if (service == 'openai') {
    spinner.succeed();
    for await (const chunk of responseGenerator) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
  } else {
    spinner.succeed();
    throw new Error(`Unknown service: ${service}`);
  }
}

/**
 * Utility function to load the appropriate service functions based on the current configuration.
 * 
 * @returns {Object} - Returns an object containing `askModelJson`, `askModel`, and `askModelStream` functions.
 */
async function loadServiceFunctions() {
  const service = getService();

  if (service === 'openai') {
    const { askModelJson, askModel, askModelStream } = await import('./clients/openai.js');
    return { askModelJson, askModel, askModelStream };
  } else if (service === 'ollama') {
    const { askModelJson, askModel, askModelStream } = await import('./clients/ollama.js');
    return { askModelJson, askModel, askModelStream };
  } else {
    throw new Error(`Unknown service: ${service}`);
  }
}
