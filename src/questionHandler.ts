import { setupPipelineBranches } from './pipelineSetup.js';
import { createInitialStep } from './handlers/initialStep.js';
import { createCommandQuestionSteps } from './handlers/commandQuestionSteps.js';
import { createTestQuestionSteps } from './handlers/testQuestionSteps.js';
import { createCodeQuestionSteps } from './handlers/codeQuestionSteps.js';
import { modifyCodeQuestionSteps } from './handlers/modifyCodeQuestionSteps.js';
import { createOtherQuestionStep } from './handlers/otherQuestionSteps.js';
import { MultiLlama, Pipeline } from 'multillama';

export async function handleCommandOrQuestion(
  modelText: string,
  modelJson: string,
  userInput: string,
): Promise<any> {
  const multillama = new MultiLlama();
  const pipeline = new Pipeline<string>();
  pipeline.setEnableLogging(false);

  const initialStep = createInitialStep(pipeline, multillama, modelJson);
  const commandQuestionStep = createCommandQuestionSteps(
    pipeline,
    multillama,
    modelJson,
  );
  const creationTestQuestionStep = createTestQuestionSteps(
    pipeline,
    multillama,
    modelJson,
  );
  const creationCodeQuestionStep = createCodeQuestionSteps(
    pipeline,
    multillama,
    modelJson,
  );
  const modifyCodeQuestionStep = modifyCodeQuestionSteps(
    pipeline,
    multillama,
    modelJson,
  );
  const otherQuestionStep = createOtherQuestionStep(
    pipeline,
    multillama,
    modelText,
  );

  setupPipelineBranches(
    pipeline,
    initialStep,
    commandQuestionStep,
    creationTestQuestionStep,
    creationCodeQuestionStep,
    modifyCodeQuestionStep,
    otherQuestionStep,
  );

  const response = await pipeline.execute(userInput);
  console.log(response);
  return response;
}
