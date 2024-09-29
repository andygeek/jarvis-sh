#!/usr/bin/env node
import { handleCommandOrQuestion } from './src/commands.js';
import { openEditor, setModel } from './src/utils.js';

const args = process.argv.slice(2);

if (args.includes('--commands') || args.includes('-e')) {
  openEditor();
} else if (args.includes('--model')) {
  const modelIndex = args.indexOf('--model');
  const model = args[modelIndex + 1];
  if (!model) {
    console.error('Please provide a model after "--model"');
    process.exit(1);
  }
  setModel(model);
} else {
  const userInput = args.join(' ');

  if (!userInput) {
    console.error('Please provide a question after "jarvis"');
    process.exit(1);
  }

  handleCommandOrQuestion(userInput);
}
