import { concatenateFileContents, createFileInTargetFolder } from '../utils.js';
import {
  createCodeMessage,
  generateCodeMessage,
} from '../messages/generalMessages.js';
import { ModelConfig, MultiLlama, Pipeline, PipelineNode } from 'multillama';

export function createCodeQuestionSteps(
  pipeline: Pipeline<string>,
  multillama: MultiLlama,
  modelJson: string,
  gpt4oJsonMax: string,
): PipelineNode<string, any> {
  const codeQuestionStep = pipeline.addStep(async (input, context) => {
    const message = createCodeMessage(context.initialInput);
    return await multillama.useModel(modelJson, [
      { role: 'user', content: message },
    ]);
  });

  const codeFinalStep = pipeline.addStep(async (input, context) => {
    const responseObj = JSON.parse(input);
    const contextFiles = responseObj.context_or_examples;
    const targetMessage = responseObj.target_message;
    context.data['targetFolderCode'] = responseObj.target_folder;
    const moreContext = responseObj.more_context;

    const concatenatedContextAndExamples =
      await concatenateFileContents(contextFiles);
    const message = generateCodeMessage(
      concatenatedContextAndExamples,
      moreContext,
      targetMessage,
    );

    return await multillama.useModel(gpt4oJsonMax, [
      { role: 'user', content: message },
    ]);
  });

  const endStepCode = pipeline.addStep(async (input, context) => {
    const responseCodeAndName = JSON.parse(input);
    const name = responseCodeAndName.name;
    const code = responseCodeAndName.code;

    await createFileInTargetFolder(
      context.data['targetFolderCode'],
      name,
      code,
    );
    return 'Se creó el archivo con éxito';
  });

  codeQuestionStep.nextNode = codeFinalStep;
  codeFinalStep.nextNode = endStepCode;

  return codeQuestionStep;
}
