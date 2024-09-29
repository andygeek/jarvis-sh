# Jarvis-sh

An AI-powered command-line assistant for your terminal.

## Description

Jarvis-sh is a console-based AI assistant that allows you to execute commands and ask questions directly from your terminal. It leverages local AI models through [Ollama](https://ollama.ai/) to provide fast and secure AI capabilities without relying on cloud services.

## Prerequisites

Before installing Jarvis-sh, ensure you have the following:

- **Node.js**: Version 14 or higher is recommended.
- **Ollama**: A runtime for large language models. Install it from [here](https://ollama.ai/).
- **AI Model**: A local AI model compatible with Ollama. We recommend using `llama3.2`.

### Installing Ollama

Follow the instructions on the [Ollama website](https://ollama.ai/) to install Ollama on your system.

### Installing the AI Model

After installing Ollama, install the `llama3.2` model by running:

```bash
ollama pull llama3.2
```

## Installation

Install Jarvis-sh globally using npm:

```bash
npm install -g jarvis-sh
```

This will make the `jarvis` command available globally on your system.

## Usage

Once installed, you can use Jarvis-sh by typing `jarvis` followed by your question or command in the terminal.

### Ask a Question

To ask a question:

```bash
jarvis Hello
```

Jarvis-sh will provide an answer directly in the terminal.

## Shell Configuration for Zsh Users

If you're using the Zsh shell and want to use the `?` symbol at the end of your questions without any issues, you need to prevent Zsh from interpreting the `?` as a globbing character.

### Adding an Alias

Add the following alias to your `~/.zshrc` file:

```bash
alias jarvis='noglob jarvis'
```

This tells Zsh not to perform filename expansion (globbing) on the arguments passed to `jarvis`.

### How to Add the Alias Using Nano

Open your `~/.zshrc` file with nano:

```bash
nano ~/.zshrc
```

Add the alias:

```bash
alias jarvis='noglob jarvis'
```

Save and reload your Zsh configuration:

```bash
source ~/.zshrc
```

Now you can use the `?` symbol at the end of your questions without any issues:

```bash
jarvis what is the capital of France?
```

### Execute Commands

If your input relates to terminal commands, Jarvis-sh will suggest commands that you can execute.

```bash
jarvis show me the commands to generate an apk
```

You will be presented with a list of commands to choose from. Select the desired command to execute it.

### Edit Custom Commands

You can add or edit custom commands that Jarvis-sh will consider when generating suggestions.

```bash
jarvis --commands
```

This will open a text editor (default is `nano` unless specified in the `EDITOR` environment variable) where you can add your custom commands.

### Set the AI Model

To change the AI model used by Jarvis-sh:

```bash
jarvis --model <model-name>
```

For example:

```bash
jarvis --model llama3.2
```

Make sure the model is installed in Ollama before setting it.

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
