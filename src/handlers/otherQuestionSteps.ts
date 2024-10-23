import { ModelConfig, MultiLlama, Pipeline, PipelineNode } from 'multillama';

export function createOtherQuestionStep(
  pipeline: Pipeline<string>,
  multillama: MultiLlama,
  modelText: string,
): PipelineNode<string, any> {
  const otherQuestionStep = pipeline.addStep(async (input, context) => {
    return await multillama.useModel(modelText, [
      { role: 'user', content: context.initialInput },
    ]);
  });

  return otherQuestionStep;
}
