# Jarvis-sh

An AI-powered command-line assistant for your terminal, compatible with both local AI models via Ollama and OpenAI. It not only supports executing commands but also intelligently suggests and finds commands from its own knowledge base or a predefined list, taking your productivity as a developer or DevOps engineer to the next level.

<div align="center">
  <img src="https://raw.githubusercontent.com/andygeek/jarvis-sh/refs/heads/master/assets/logo.png" alt="Descripción de la imagen" width="200px" />
</div>

## Prerequisites

Before installing Jarvis-sh, ensure you have the following:

- **Node.js**: Version 14 or higher is recommended. This is required for running Jarvis-sh.
- **Ollama** (Optional): If you want to use local open-source AI models, you'll need to install Ollama, a runtime for large language models. You can install it from [here](https://ollama.ai/).
- **AI Model** (Optional): A local AI model compatible with Ollama. We recommend using `llama3.2`. Make sure the model is downloaded and available for use.

### Installing Ollama

Follow the instructions on the [Ollama website](https://ollama.ai/) to install Ollama on your system.

### Installing the AI Model

After installing Ollama, install the `llama3.2` model by running:

```bash
ollama pull llama3.2
```

## Installation jarvis-sh

Install Jarvis-sh globally using npm:

```bash
npm install -g jarvis-sh
```

This will make the `jarvis` command available globally on your system.

## Configuration

### AI Service

First, you need to configure the AI service you will use:

```bash
jarvis --service <service>
```

Currently, we support `ollama` and `openai`. More services, such as **Gemini** and **Claude**, will be added soon.

### AI Model

Next, configure the AI model you want to use:

```bash
jarvis --model <model>
```

For OpenAI, the available models are those supported by the OpenAI API. We recommend using `gpt-4o-mini` for its low cost.
For **Ollama**, the models are those you have installed locally. You can use the command `ollama list` to see all installed models.

### API Key (For OpenAI)

If you're using a closed service like **OpenAI**, you need to set your API key. You can obtain this key from the OpenAI website.

```bash
jarvis --service-api-key <api-key>
```

## Usage

Once installed, you can use Jarvis-sh by typing `jarvis` followed by your question or command in the terminal.

### Ask a Question

To ask a question:

```bash
jarvis Hello
```

Jarvis-sh will provide an answer directly in the terminal.

If you want to use the `?` symbol at the end of your questions to Jarvis, you need to apply the [following configuration](.doc/ZshUsers.md) in your terminal.

### Execute Commands

If your input relates to terminal commands, Jarvis-sh will suggest commands that you can execute.

```bash
jarvis show me the commands to generate an apk?
```

You will be presented with a list of commands to choose from. Select the desired command to execute it.

### Edit Custom Commands

You can add or edit custom commands that Jarvis-sh will consider when generating suggestions.

```bash
jarvis --commands
```

This will open a text editor (default is `nano` unless specified in the `EDITOR` environment variable) where you can add your custom commands.

## Tools

Currently, we offer a tool called `/commit`, which generates the title and description of your staged changes in your Git repository using the **Conventional Commits** format. To use it, simply run the following command:

```bash
jarvis /commit
```

Example response:
```bash
Title: feat: update README with new configuration options and services
Description: Enhanced the README.md by adding new sections for AI service configuration, model configuration, and API key setup for OpenAI. Updated prerequisites to clarify the installation requirements for Node.js and Ollama. Improved descriptions for features and included instructions for service options, enhancing overall clarity and usability.
Do you want to commit with this message? (y/n)
```

More tools will be added soon.

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
