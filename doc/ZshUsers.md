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