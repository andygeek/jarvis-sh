export function commitMessage(diff: string): string {
  return `
  Conventional Commits is a specification for writing consistent and meaningful commit messages. The structure of a conventional commit is as follows:

  <type>: <short description>

  - **type**: Specifies the category of the change. Common types are:
    - 'feat': A new feature
    - 'fix': A bug fix
    - 'chore': Routine tasks or maintenance
    - 'refactor': Code changes that don't affect functionality
    - 'docs': Documentation-only changes
    - 'test': Adding or updating tests
    - 'style': Code style changes (e.g., formatting)

  ---

  Use the following git diff and give me the title and short description for the commit using conventional commits. The description must have a maximum of 30 words in English:

  ${diff}

  Give me a JSON with only the title and description using conventional commits`.trim();
}
