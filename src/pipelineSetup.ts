import { Pipeline, PipelineNode } from 'multillama';
import { createCommandQuestionSteps } from './handlers/commandQuestionSteps.js';
import { createTestQuestionSteps } from './handlers/testQuestionSteps.js';
import { createCodeQuestionSteps } from './handlers/codeQuestionSteps.js';
import { modifyCodeQuestionSteps } from './handlers/modifyCodeQuestionSteps.js';
import { createOtherQuestionStep } from './handlers/otherQuestionSteps.js';

export function setupPipelineBranches(
  pipeline: Pipeline<string>,
  initialStep: PipelineNode<string, any>,
  commandQuestionStep: PipelineNode<string, any>,
  creationTestQuestionStep: PipelineNode<string, any>,
  creationCodeQuestionStep: PipelineNode<string, any>,
  modifyCodeQuestionStep: PipelineNode<string, any>,
  otherQuestionStep: PipelineNode<string, any>,
) {
  pipeline.addBranch(initialStep, 'command_question', commandQuestionStep);
  pipeline.addBranch(
    initialStep,
    'creation_test_question',
    creationTestQuestionStep,
  );
  pipeline.addBranch(
    initialStep,
    'creation_code_question',
    creationCodeQuestionStep,
  );
  pipeline.addBranch(
    initialStep,
    'modification_code_question',
    modifyCodeQuestionStep,
  );
  pipeline.addBranch(initialStep, 'other_question', otherQuestionStep);
}
