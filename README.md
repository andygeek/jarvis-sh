# Jarvis-sh

An AI-powered command-line assistant for your terminal, compatible with both local AI models via Ollama and OpenAI. It not only supports executing commands but also intelligently suggests and finds commands from its own knowledge base or a predefined list, taking your productivity as a developer or DevOps engineer to the next level.

<div align="center">
  <img src="https://imgur.com/kpM3SQ2.png" alt="Descripción de la imagen" width="200px" />
</div>

## Prerequisites

Before installing Jarvis-sh, ensure you have the following:

- **Node.js**: Version 19 or higher is recommended. This is required for running Jarvis-sh.
- **Ollama** (Optional): If you want to use local open-source AI models, you'll need to install Ollama, a runtime for large language models. You can install it from [here](https://ollama.ai/).
- **AI Model** (Optional): A local AI model compatible with Ollama. We recommend using `llama3.2`. Make sure the model is downloaded and available for use.

### Installing Ollama

Follow the instructions on the [Ollama website](https://ollama.ai/) to install Ollama on your system.

### Installing the AI Model

After installing Ollama, install the `llama3.2` model by running:

```bash
ollama pull llama3.1:8b
```

## Installation jarvis-sh

Install Jarvis-sh globally using npm:

```bash
npm install -g jarvis-sh
```

This will make the `jarvis` command available globally on your system.

## Configuration

### AI Service and Model

You can set up both the AI service and the model using the interactive setup command:

```bash
jarvis --setup
```

This command will guide you through selecting the AI service and model. Currently, we support the following services:

- `OpenAI`
- `Anthropic`
- `Ollama`

For **OpenAI** and **Anthropic**, you will need to provide an API key, which you can obtain from the respective provider. For **Ollama**, the models available are those installed locally, and you can list them using `ollama list`.

### API Key (For OpenAI and Anthropic)

If you choose **OpenAI** or **Anthropic** as your AI service, you will be prompted to enter your API key during the setup process. Be sure to have it ready beforehand.

This is all handled automatically when using the `--setup` command, so no need for additional configuration commands.

## Usage

Once installed, you can use Jarvis-sh by typing `jarvis` followed by your question or command in the terminal.

### Ask a Question

To ask a question:

```bash
jarvis Hello
```

Jarvis-sh will provide an answer directly in the terminal.

If you want to use the `?` symbol at the end of your questions to Jarvis, you need to apply the [following configuration](doc/ZshUsers.md) in your terminal.

### Commands

With Jarvis, you can use some commands like `/c` to get the list of commands or `/ct` to create unit tests.

#### 1. Command List

To do this, use the `/cmd` command followed by a description of the command you're looking for.

```bash
jarvis /cmd to create a project with vue named AndyDevBlog
```

If you want to edit the list of custom commands, use `jarvis --commands` to open the file with the custom command list where Jarvis will look for your command.

#### 2. Create Unit Tests

To do this, use the `/ct` command followed by the relative path of the file for which you want to create a unit test. You should also include the relative path of the folder where you want the unit tests to be created. You can also add the relative path of example files or general context to help Jarvis generate more accurate unit tests.

```bash
jarvis /ct for the file ./src/components/HelloWorld.vue in the folder ./tests/unit/components, using as examples the files ./src/components/Header.vue, ./src/components/HeroSection.vue
```

#### 3. Create Commit Title and Description

Currently, we offer a command called `/commit`, which generates the title and description of your staged changes in your Git repository using the **Conventional Commits** format. To use it, simply run the following command:

```bash
jarvis /commit
```

Example response:
```bash
Title: feat: update README with new configuration options and services
Description: Enhanced the README.md by adding new sections for AI service configuration, model configuration, and API key setup for OpenAI. Updated prerequisites to clarify the installation requirements for Node.js and Ollama. Improved descriptions for features and included instructions for service options, enhancing overall clarity and usability.
Do you want to commit with this message? (y/n)
```

## Troubleshooting

### Ollama is Not Initialized

If you encounter the error:

```
Ollama is not initialized.
```

Ensure that Ollama is running. Start Ollama by running:

```bash
ollama serve
```

### Model Not Found

If the AI model is not installed, you will see an error message indicating that the model does not exist.

Install the required model using:

```bash
ollama pull <model-name>
```

For example:

```bash
ollama pull llama3.2
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.
