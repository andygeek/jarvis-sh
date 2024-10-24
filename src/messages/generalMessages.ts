export function isCommandMessage(userInput: string): string {
  return `
  Is the following question about terminal commands?
  ${userInput}
  Give me a JSON with {"isCommand": true} for yes, and with {"isCommand": false}.`.trim();
}

export function typeQuestionMessage(userInput: string): string {
  return `
  ${userInput}
  ---
  Classify the previous question into one of the following categories:
  - 'command_question': if the question is about a command executed in a terminal or command-line interface.
  - 'creation_test_question': if the question is specifically asking for the creation of unit tests in a new file.
  - 'creation_code_question': if the question is specifically asking for the creation of code or files, different from unit tests.
  - 'modification_code_question': if the question is specifically asking to modify or correct an existing file or unit test, including adding missing unit tests to an existing test file.
  - 'other_question': if the question does not fit into any of the above categories.
  Think step by step, and give me the response in JSON format: {category: 'one_of_the_categories'}.`.trim();
}

export function findCommandMessage(
  customCommandsContent: string,
  userInput: string,
): string {
  return `Custom commands available:
  ${customCommandsContent}

  Taking that into account, respond with a JSON containing a list of commands that can solve the following request:

  ${userInput}

  Give me a JSON in the following format: 
  {
  "commands": ["command1", "command2", "..."]
  }
  `.trim();
}

export function createTestMessage(userInput: string): string {
  return `
  ${userInput}
  ---
  From the previous question, extract the following information and return it in JSON format:
  1. **Target testing file**: An file path of the file that needs to be tested mentioned in the query.
  2. **Context or examples**: An array of files paths of context or examples mentioned in the query.
  3. **Target folder**: The destination folder where the action is supposed to take place (if mentioned).
  4. **More context**: Extract the additional context indicated in the previous question to create the unit tests without considering file paths or files.

  If any of the elements are missing in the query, leave them as empty strings or an empty array.

  Return the information in this JSON structure:
  {
    "target_testing_file": "",
    "context_or_examples": [],
    "target_folder": "",
    "more_context": ""
  }
  `.trim();
}

export function createCodeMessage(userInput: string): string {
  return `
  ${userInput}
  ---
  From the previous question, extract the following information and return it in JSON format:
  1. **Target message**: Here, only the objective of the question should be transcribed without file paths or folders
  2. **Context or examples**: An array of file paths of context or examples mentioned in the query.
  3. **Target folder**: The destination folder where the action is supposed to take place (if mentioned).
  4. **More context**: Extract the additional context indicated in the previous question to create the unit tests without considering file paths or files.

  If any of the elements are missing in the query, leave them as empty strings or an empty array.

  Return the information in this JSON structure:
  {
    "target_message": "",
    "context_or_examples": [],
    "target_folder": "",
    "more_context": ""
  }
  `.trim();
}

export function modifyCodeMessageClasification(userInput: string): string {
  return `
  ${userInput}
  ---
  From the previous question, extract the following information and return it in JSON format:
  1. **Target message**: Here, only the objective of the question should be transcribed without file paths or folders
  2. **Modify file**: This is the relative path of file objective to be modified.
  3. **Context or examples**: An array of file paths of context or examples mentioned in the query.
  4. **More context**: Extract the additional context indicated in the previous question to create the unit tests without considering file paths or files.

  If any of the elements are missing in the query, leave them as empty strings or an empty array.

  Return the information in this JSON structure:
  {
    "target_message": "",
    "modify_file": "",
    "context_or_examples": [],
    "more_context": ""
  }
  `.trim();
}

export function generateTestMessage(
  contextAndExample: string,
  targetTest: string,
  moreContext: string,
): string {
  return `
    Taking into account the following code as an example or context:
    ${contextAndExample}
    ---
    Generate the test for the following code:
    ${targetTest}
    ---
    Also keep the following in mind:
    ${moreContext}
    ---
    Provide the file name(no path, only file name) and the complete code in JSON format with the following structure: { 'name': '', 'code': '', }
    `;
}

export function generateCodeMessage(
  contextAndExample: string,
  moreContext: string,
  targetMessage: string,
): string {
  return `
    Taking into account the following code as an example or context:
    ${contextAndExample}
    ---
    Generate the code to solve the following objective:
    ${targetMessage}
    ---
    Also keep the following in mind:
    ${moreContext}
    ---
    Provide the file name(no path, only file name) and the complete code in JSON format with the following structure: { 'name': '', 'code': '', }
    `;
}

export function modifyCodeMessage(
  contextAndExample: string,
  targetCode: string,
  moreContext: string,
  targetMessage: string,
): string {
  return `
    Taking into account the following code as an example or context:
    ${contextAndExample}
    ---
    Modify the following code:
    ${targetCode}
    ---
    To achieve the following objective
    ${targetMessage}
    ---
    Also keep the following in mind:
    ${moreContext}
    ---
    Provide the code in JSON format with the following structure: { 'code': ''}
    `;
}

export function generateOtherCommands(userInput: string): string {
  return `
    Respond with a JSON containing a list of commands that can solve the following request:

    ${userInput}

    Give me a JSON in the following format: 
    {
    "commands": ["command1", "command2", "..."]
    }
    `.trim();
}
