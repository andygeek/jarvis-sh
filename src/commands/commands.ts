import { MultiLlama, Pipeline } from 'multillama';
import { commandQuestionPipeline } from '../pipelines/commandQuestionPipeline.js';

export async function handleCommands(modelJson: string, userInput: string) {
  const multillama = new MultiLlama();
  const pipeline = new Pipeline<string>();

  pipeline.setEnableLogging(false);

  commandQuestionPipeline(pipeline, multillama, modelJson);

  const response = await pipeline.execute(userInput);
  console.log(response);
  return response;
}
