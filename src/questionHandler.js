import {
  loadCustomCommandsContent,
  showCommandOptions,
  concatenateFileContents,
  createFileInTargetFolder,
  createOrUpdateFile
} from './utils.js';

import {
  typeQuestionMessage,
  findCommandMessage,
  createTestMessage,
  generateTestMessage,
  generateOtherCommands,
  createCodeMessage,
  generateCodeMessage,
  modifyCodeMessageClasification,
  modifyCodeMessage
} from './messages/generalMessages.js';

import { MultiLlama, Pipeline } from 'multillama';

export async function handleCommandOrQuestion(modelText, modelJson, gpt4oJsonMax, userInput) {
  const multillama = new MultiLlama();
  const pipeline = new Pipeline();
  pipeline.setEnableLogging(false);

  const initialStep = createInitialStep(pipeline, multillama, modelJson);
  const commandQuestionStep = createCommandQuestionSteps(pipeline, multillama, modelJson);
  const creationTestQuestionStep = createTestQuestionSteps(pipeline, multillama, modelJson, gpt4oJsonMax);
  const creationCodeQuestionStep = createCodeQuestionSteps(pipeline, multillama, modelJson, gpt4oJsonMax);
  const modifyCodeQuestionStep = modifyCodeQuestionSteps(pipeline, multillama, modelJson, gpt4oJsonMax);
  const otherQuestionStep = createOtherQuestionStep(pipeline, multillama, modelText);

  setupPipelineBranches(pipeline, initialStep, commandQuestionStep, creationTestQuestionStep, creationCodeQuestionStep, modifyCodeQuestionStep, otherQuestionStep);

  const response = await pipeline.execute(userInput);
  console.log(response);
  return response;
}

function createInitialStep(pipeline, multillama, modelJson) {
  const initialStep = pipeline.addStep(async (input, context) => {
    const message = typeQuestionMessage(input);
    const response = await multillama.useModel(modelJson, [{ role: 'user', content: message }]);
    const jsonResponse = JSON.parse(response);
    return jsonResponse.category;
  });

  return initialStep;
}

function createCommandQuestionSteps(pipeline, multillama, modelJson) {
  const commandQuestionStep = pipeline.addStep(async (input, context) => {
    const customCommandsContent = loadCustomCommandsContent();
    const message = findCommandMessage(customCommandsContent, context.initialInput);
    const result = await multillama.useModel(modelJson, [{ role: 'user', content: message }]);
    const jsonResponse = JSON.parse(result);
    const commandsList = jsonResponse.commands || [];
    context.data['commandsList'] = commandsList;
    return commandsList.length > 0;
  });

  const showCommandOptionsStep = pipeline.addStep(async (input, context) => {
    context.successSpinner();
    await showCommandOptions(context.data['commandsList']);
  });

  const searchCommandStep = pipeline.addStep(async (input, context) => {
    const message = generateOtherCommands(context.initialInput);
    return await multillama.useModel(modelJson, [{ role: 'user', content: message }]);
  });

  const showNewCommandsStep = pipeline.addStep(async (input, context) => {
    const jsonResponse = JSON.parse(input);
    const commandsList = jsonResponse.commands || [];
    context.successSpinner();
    await showCommandOptions(commandsList);
  });

  searchCommandStep.nextNode = showNewCommandsStep;

  pipeline.addBranch(commandQuestionStep, true, showCommandOptionsStep);
  pipeline.addBranch(commandQuestionStep, false, searchCommandStep);

  return commandQuestionStep;
}

function createTestQuestionSteps(pipeline, multillama, modelJson, gpt4oJsonMax) {
  const testQuestionStep = pipeline.addStep(async (input, context) => {
    const message = createTestMessage(context.initialInput);
    return await multillama.useModel(modelJson, [{ role: 'user', content: message }]);
  });

  const testFinalStep = pipeline.addStep(async (input, context) => {
    const responseObj = JSON.parse(input);
    const contextFiles = responseObj.context_or_examples;
    const targetTestingFile = responseObj.target_testing_file;
    context.data['targetFolderTest'] = responseObj.target_folder;
    const moreContext = responseObj.more_context;

    const concatenatedContextAndExamples = await concatenateFileContents(contextFiles);
    const concatenatedTargetTestingFile = await concatenateFileContents([targetTestingFile]);
    const message = generateTestMessage(
      concatenatedContextAndExamples,
      concatenatedTargetTestingFile,
      moreContext
    );

    return await multillama.useModel(gpt4oJsonMax, [{ role: 'user', content: message }]);
  });

  const endStepTests = pipeline.addStep(async (input, context) => {
    const responseCodeAndName = JSON.parse(input);
    const name = responseCodeAndName.name;
    const code = responseCodeAndName.code;

    createFileInTargetFolder(context.data['targetFolderTest'], name, code);
    return 'Se creó el archivo con éxito';
  });

  testQuestionStep.nextNode = testFinalStep;
  testFinalStep.nextNode = endStepTests;

  return testQuestionStep;
}

function createCodeQuestionSteps(pipeline, multillama, modelJson, gpt4oJsonMax) {
  const codeQuestionStep = pipeline.addStep(async (input, context) => {
    const message = createCodeMessage(context.initialInput);
    return await multillama.useModel(modelJson, [{ role: 'user', content: message }]);
  });

  const codeFinalStep = pipeline.addStep(async (input, context) => {
    const responseObj = JSON.parse(input);
    const contextFiles = responseObj.context_or_examples;
    const targetMessage = responseObj.target_message;
    context.data['targetFolderCode'] = responseObj.target_folder;
    const moreContext = responseObj.more_context;

    const concatenatedContextAndExamples = await concatenateFileContents(contextFiles);
    const message = generateCodeMessage(
      concatenatedContextAndExamples,
      moreContext,
      targetMessage
    );

    return await multillama.useModel(gpt4oJsonMax, [{ role: 'user', content: message }]);
  });

  const endStepCode = pipeline.addStep(async (input, context) => {
    const responseCodeAndName = JSON.parse(input);
    const name = responseCodeAndName.name;
    const code = responseCodeAndName.code;

    createFileInTargetFolder(context.data['targetFolderCode'], name, code);
    return 'Se creó el archivo con éxito';
  });

  codeQuestionStep.nextNode = codeFinalStep;
  codeFinalStep.nextNode = endStepCode;

  return codeQuestionStep;
}

function modifyCodeQuestionSteps(pipeline, multillama, modelJson, gpt4oJsonMax) {
  const modifyQuestionStep = pipeline.addStep(async (input, context) => {
    const message = modifyCodeMessageClasification(context.initialInput);
    return await multillama.useModel(modelJson, [{ role: 'user', content: message }]);
  });

  const modifyFinalStep = pipeline.addStep(async (input, context) => {
    const responseObj = JSON.parse(input);
    const contextFiles = responseObj.context_or_examples;
    const targetMessage = responseObj.target_message;
    const targetModifyFile = responseObj.modify_file;
    context.data['modifyPath'] = responseObj.modify_file;
    // context.data['targetFolderCode'] = responseObj.target_folder;
    const moreContext = responseObj.more_context;

    const concatenatedContextAndExamples = await concatenateFileContents(contextFiles);
    const concatenatedCode = await concatenateFileContents([targetModifyFile]);
    const message = modifyCodeMessage(
      concatenatedContextAndExamples,
      concatenatedCode,
      moreContext,
      targetMessage
    );

    return await multillama.useModel(gpt4oJsonMax, [{ role: 'user', content: message }]);
  });

  const endStepCode = pipeline.addStep(async (input, context) => {
    const responseCodeAndName = JSON.parse(input);
    const code = responseCodeAndName.code;

    createOrUpdateFile(context.data['modifyPath'], code);
    return 'Se creó el archivo con éxito';
  });

  modifyQuestionStep.nextNode = modifyFinalStep;
  modifyFinalStep.nextNode = endStepCode;

  return modifyQuestionStep;
}

function createOtherQuestionStep(pipeline, multillama, modelText) {
  const otherQuestionStep = pipeline.addStep(async (input, context) => {
    return await multillama.useModel(modelText, [{role: 'user', content: context.initialInput}]);
  });

  return otherQuestionStep;
}

function setupPipelineBranches(pipeline, initialStep, commandQuestionStep, creationTestQuestionStep, creationCodeQuestionStep, modifyCodeQuestionStep, otherQuestionStep) {
  pipeline.addBranch(initialStep, 'command_question', commandQuestionStep);
  pipeline.addBranch(initialStep, 'creation_test_question', creationTestQuestionStep);
  pipeline.addBranch(initialStep, 'creation_code_question', creationCodeQuestionStep);
  pipeline.addBranch(initialStep, 'modification_code_question', modifyCodeQuestionStep);
  pipeline.addBranch(initialStep, 'other_question', otherQuestionStep);
}


// Que pasa si no llega el target_folder, donde te entrego el codigo que hice
// Un problema de jarvis es que pierde contexto. quizas usando ...jarvis o jarvis ... para que tome contexto anteriior y sigua la linea de preguntas.
// Devolver comentarios adicionales luego de crear un codigo. Estos comentarios devolverlos en la consola