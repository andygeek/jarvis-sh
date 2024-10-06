#!/usr/bin/env node
import { openEditor, setModel } from './src/utils.js';
import { generateCommitMessage, askCommitConfirmationAndExecute } from './src/commands/commit.js';
import { handleCommandOrQuestion } from './src/commands.js';

// Capture command-line arguments.
const args = process.argv.slice(2);

// Capture /commit command
if (args.includes('/commit')) {
  const commitData = await generateCommitMessage();

  if (!commitData) {
    process.exit(1);
  }

  const { title, description } = commitData;
  askCommitConfirmationAndExecute(title, description);

// Capture command-line arguments.
} else if (args.includes('--commands')) {
  openEditor();

// Check for the `--model` flag to set a specific model.
} else if (args.includes('--model')) {
  const modelIndex = args.indexOf('--model');
  const model = args[modelIndex + 1];
  if (!model) {
    console.error('Please provide a model after "--model"');
    process.exit(1);
  }
  setModel(model);

// Default behavior: handle the input as a command or question.
} else {
  const userInput = args.join(' ');

  if (!userInput) {
    console.error('Please provide a question after "jarvis"');
    process.exit(1);
  }

  handleCommandOrQuestion(userInput);
}
