import { askModel, askModelStream } from './ollamaClient.js';
import { loadCustomCommandsContent, showCommandOptions, readConfig } from './utils.js';

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
