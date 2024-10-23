#!/usr/bin/env node
import inquirer from 'inquirer';
import { openEditor } from './utils/commandUtils.js';
import {
  generateCommitMessage,
  askCommitConfirmationAndExecute,
} from './commands/commit.js';
import { handleCommandOrQuestion } from './questionHandler.js';
import {
  MultiLlama,
  OpenAiAdapter,
  OllamaAdapter,
  AnthropicAdapter,
  Config,
} from 'multillama';
import { saveConfig, showConfig, loadConfig } from './utils/configUtils.js';
import { listOllamaModels } from './utils/ollamaUtils.js';

const modelText = 'modelText';
const modelJson = 'modelJson';

async function interactiveSetup() {
  let configJson: Record<string, string> = {};

  const { service } = await inquirer.prompt([
    {
      type: 'list',
      name: 'service',
      message: 'Which service would you like to configure?',
      choices: ['OpenAI', 'Anthropic', 'Ollama'],
    },
  ]);

  configJson.service = service;

  if (service === 'OpenAI' || service === 'Anthropic') {
    const { apiKey } = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: `Enter your ${service} API key:`,
      },
    ]);

    configJson.apiKey = apiKey;

    const { model } = await inquirer.prompt([
      {
        type: 'list',
        name: 'model',
        message: `Which model would you like to use with ${service}?`,
        choices:
          service === 'OpenAI'
            ? ['gpt-4o', 'gpt-4o-mini']
            : ['claude-3-5-sonnet-latest', 'claude-3-5-sonnet-20240620'],
      },
    ]);

    configJson.model = model;
  } else {
    const models = await listOllamaModels();

    if (models.length === 0) {
      console.error('No Ollama models found. Please install a model first.');
      process.exit(1);
    }

    const { model } = await inquirer.prompt([
      {
        type: 'list',
        name: 'model',
        message: 'Which Ollama model would you like to use?',
        choices: models,
      },
    ]);

    configJson.model = model;
  }
  await saveConfig(configJson);
}

async function initializeTool() {
  let configJson = await loadConfig();
  let maxTokens = 8000;

  let config: Config = {
    services: {},
    models: {},
    spinnerConfig: {
      loadingMessage: 'Thinking...',
      successMessage: 'Your answer is ready!',
      errorMessage: 'Uh-oh! It seems we hit a snag. Give it another go!',
    },
  };

  switch (configJson.service) {
    case 'OpenAI':
      maxTokens = 16384;
      config.services['OpenAI'] = {
        adapter: new OpenAiAdapter(),
        apiKey: configJson.apiKey,
      };
      break;
    case 'Anthropic':
      maxTokens = 8192;
      config.services['Anthropic'] = {
        adapter: new AnthropicAdapter(),
        apiKey: configJson.apiKey,
      };
      break;
    case 'Ollama':
      config.services['Ollama'] = {
        adapter: new OllamaAdapter(),
      };
      break;
    default:
      config.services['Ollama'] = {
        adapter: new OllamaAdapter(),
      };
      break;
  }

  if (configJson.model == null || configJson.model == '') {
    const firstOllamaModel = 'llama3.1:8b';

    config.models[modelText] = {
      service: config.services[0],
      name: firstOllamaModel,
      response_format: 'text',
    };
    config.models[modelJson] = {
      service: config.services[0],
      name: firstOllamaModel,
      response_format: 'json',
    };
  } else {
    const [, firstModel] = Object.entries(config.services)[0];
    config.models[modelText] = {
      service: firstModel,
      name: configJson.model,
      response_format: 'text',
    };

    config.models[modelJson] = {
      service: firstModel,
      name: configJson.model,
      response_format: 'json',
      max_tokens: maxTokens,
    };
  }

  MultiLlama.initialize(config);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--setup')) {
    await interactiveSetup();
  }

  await initializeTool();

  if (args.includes('--show-config')) {
    await showConfig();
  } else if (args.includes('--commands')) {
    openEditor();
  } else if (args.includes('/commit')) {
    const commitData = await generateCommitMessage(modelJson);

    if (!commitData) {
      process.exit(1);
    }

    const { title, description } = commitData;
    askCommitConfirmationAndExecute(title, description);
  } else {
    const userInput = args.join(' ');

    if (!userInput) {
      console.error('Please provide a question after "jarvis"');
      process.exit(1);
    }

    await handleCommandOrQuestion(modelText, modelJson, userInput);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
