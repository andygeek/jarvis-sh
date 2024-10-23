import { typeQuestionMessage } from '../messages/generalMessages.js';
import { MultiLlama, Pipeline, PipelineNode } from 'multillama';

export function createInitialStep(
  pipeline: Pipeline<string>,
  multillama: MultiLlama,
  modelJson: string,
): PipelineNode<string, any> {
  const initialStep = pipeline.addStep(async (input: string) => {
    const message = typeQuestionMessage(input);
    const response = await multillama.useModel(modelJson, [
      { role: 'user', content: message },
    ]);
    const jsonResponse = JSON.parse(response);
    return jsonResponse.category;
  });

  return initialStep;
}
