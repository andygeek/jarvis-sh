import {
  concatenateFileContents,
  createOrUpdateFile,
} from '../utils/fileUtils.js';
import {
  modifyCodeMessageClasification,
  modifyCodeMessage,
} from '../messages/generalMessages.js';
import { MultiLlama, Pipeline, PipelineNode } from 'multillama';

export function modifyCodeQuestionSteps(
  pipeline: Pipeline<string>,
  multillama: MultiLlama,
  modelJson: string,
  gpt4oJsonMax: string,
): PipelineNode<string, any> {
  const modifyQuestionStep = pipeline.addStep(async (input, context) => {
    const message = modifyCodeMessageClasification(context.initialInput);
    return await multillama.useModel(modelJson, [
      { role: 'user', content: message },
    ]);
  });

  const modifyFinalStep = pipeline.addStep(async (input, context) => {
    const responseObj = JSON.parse(input);
    const contextFiles = responseObj.context_or_examples;
    const targetMessage = responseObj.target_message;
    const targetModifyFile = responseObj.modify_file;
    context.data['modifyPath'] = responseObj.modify_file;
    const moreContext = responseObj.more_context;

    const concatenatedContextAndExamples =
      await concatenateFileContents(contextFiles);
    const concatenatedCode = await concatenateFileContents([targetModifyFile]);
    const message = modifyCodeMessage(
      concatenatedContextAndExamples,
      concatenatedCode,
      moreContext,
      targetMessage,
    );

    return await multillama.useModel(gpt4oJsonMax, [
      { role: 'user', content: message },
    ]);
  });

  const endStepCode = pipeline.addStep(async (input, context) => {
    const responseCodeAndName = JSON.parse(input);
    const code = responseCodeAndName.code;

    await createOrUpdateFile(context.data['modifyPath'], code);
    return 'Se creó el archivo con éxito';
  });

  modifyQuestionStep.nextNode = modifyFinalStep;
  modifyFinalStep.nextNode = endStepCode;

  return modifyQuestionStep;
}
