#!/usr/bin/env node
import { handleCommandOrQuestion } from './src/commands.js';
import { openEditor, setModel } from './src/utils.js';

// Capture command-line arguments.
const args = process.argv.slice(2);

// Capture command-line arguments.
if (args.includes('--commands')) {
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
