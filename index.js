#!/usr/bin/env node
import { openEditor, setModel, setServiceApiKey, setService } from './src/utils.js';
import { generateCommitMessage, askCommitConfirmationAndExecute } from './src/commands/commit.js';
import { handleCommandOrQuestion } from './src/questionHandler.js';
import { MultiLlama, OpenAIAdapter, OllamaAdapter, AnthropicAdapter } from 'multillama';


const openai = {
  adapter: new OpenAIAdapter(),
  apiKey: ''
}

const anthropic = {
  adapter: new AnthropicAdapter(),
  apiKey: ''
}

const claudeText = {
  service: anthropic,
  name: 'claude-3-5-sonnet-20240620',
  response_format: 'text'
}

const claudeJson = {
  service: anthropic,
  name: 'claude-3-opus-20240229',
  response_format: 'json',
  max_tokens: 4000
}

const gpt4oJson = {
  service: openai,
  name: 'gpt-4o',
  role: 'user',
  response_format: 'json'
}

const gpt4oJsonMax = {
  service: openai,
  name: 'gpt-4o',
  role: 'user',
  response_format: 'json',
  max_tokens: 4000
}

const gpt4oText = {
  service: openai,
  name: 'gpt-4o',
  response_format: 'text'
}

const llama3_1Json = {
  service: ollama,
  name: 'llama3.1:8b',
  response_format: 'json',
}

const llama3_1Text = {
  service: ollama,
  name: 'llama3.1:8b',
  response_format: 'text'
}

const config = {
  services: {
    openai,
    ollama,
    anthropic
  },
  models: {
    claudeText,
    claudeJson,
    gpt4oJson,
    gpt4oText,
    gpt4oJsonMax,
    llama3_1Json,
    llama3_1Text
  },
  spinnerConfig: {
    loadingMessage: 'Thinking...',
    successMessage: 'Your answer is ready!',
    errorMessage: 'Uh-oh! It seems we hit a snag. Give it another go!',
  },
};

MultiLlama.initialize(config);

// Capture command-line arguments.
const args = process.argv.slice(2);

// Capture /commit command
if (args.includes('/commit')) {
  const commitData = await generateCommitMessage('claudeJson');

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

// Check for the --service-api-key flag to store the API key.
} else if (args.includes('--service-api-key')) {
  const keyIndex = args.indexOf('--service-api-key');
  const apiKey = args[keyIndex + 1];
  if (!apiKey) {
    console.error('Please provide an API key after "--service-api-key"');
    process.exit(1);
  }
  setServiceApiKey(apiKey);

// Check for the --service flag to store the service name.
} else if (args.includes('--service')) {
  const serviceIndex = args.indexOf('--service');
  const service = args[serviceIndex + 1];
  if (!service) {
    console.error('Please provide a service name after "--service"');
    process.exit(1);
  }
  setService(service);

// Default behavior: handle the input as a command or question.
} else {
  const userInput = args.join(' ');

  if (!userInput) {
    console.error('Please provide a question after "jarvis"');
    process.exit(1);
  }

  handleCommandOrQuestion('claudeText', 'claudeJson', 'claudeJson', userInput);
}
