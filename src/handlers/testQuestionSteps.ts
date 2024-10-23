import {
  concatenateFileContents,
  createFileInTargetFolder,
} from '../utils/fileUtils.js';
import {
  createTestMessage,
  generateTestMessage,
} from '../messages/generalMessages.js';
import { MultiLlama, Pipeline, PipelineNode } from 'multillama';

export function createTestQuestionSteps(
  pipeline: Pipeline<string>,
  multillama: MultiLlama,
  modelJson: string,
  gpt4oJsonMax: string,
): PipelineNode<string, any> {
  const testQuestionStep = pipeline.addStep(async (input, context) => {
    const message = createTestMessage(context.initialInput);
    return await multillama.useModel(modelJson, [
      { role: 'user', content: message },
    ]);
  });

  const testFinalStep = pipeline.addStep(async (input, context) => {
    const responseObj = JSON.parse(input);
    const contextFiles = responseObj.context_or_examples;
    const targetTestingFile = responseObj.target_testing_file;
    context.data['targetFolderTest'] = responseObj.target_folder;
    const moreContext = responseObj.more_context;

    const concatenatedContextAndExamples =
      await concatenateFileContents(contextFiles);
    const concatenatedTargetTestingFile = await concatenateFileContents([
      targetTestingFile,
    ]);
    const message = generateTestMessage(
      concatenatedContextAndExamples,
      concatenatedTargetTestingFile,
      moreContext,
    );

    return await multillama.useModel(gpt4oJsonMax, [
      { role: 'user', content: message },
    ]);
  });

  const endStepTests = pipeline.addStep(async (input, context) => {
    const responseCodeAndName = JSON.parse(input);
    const name = responseCodeAndName.name;
    const code = responseCodeAndName.code;

    await createFileInTargetFolder(
      context.data['targetFolderTest'],
      name,
      code,
    );
    return 'Se creó el archivo con éxito';
  });

  testQuestionStep.nextNode = testFinalStep;
  testFinalStep.nextNode = endStepTests;

  return testQuestionStep;
}
