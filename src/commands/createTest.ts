import { MultiLlama, Pipeline } from 'multillama';
import { createTestQuestionPipeline } from '../pipelines/createTestQuestionPipeline.js';

export async function handleCreateTest(modelJson: string, userInput: string) {
  const multillama = new MultiLlama();
  const pipeline = new Pipeline<string>();

  pipeline.setEnableLogging(false);

  createTestQuestionPipeline(pipeline, multillama, modelJson);

  const response = await pipeline.execute(userInput);
  console.log(response);
  return response;
}
