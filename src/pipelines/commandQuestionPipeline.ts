import {
  loadCustomCommandsContent,
  showCommandOptions,
} from '../utils/commandUtils.js';
import {
  findCommandMessage,
  generateOtherCommands,
} from '../messages/generalMessages.js';
import { Pipeline, PipelineContext, MultiLlama } from 'multillama';

export function commandQuestionPipeline(
  pipeline: Pipeline<any>,
  multillama: MultiLlama,
  modelJson: string,
): void {
  const commandQuestionStep = pipeline.addStep(
    async (input: any, context: PipelineContext<string>): Promise<any> => {
      const customCommandsContent = loadCustomCommandsContent();
      const message = findCommandMessage(
        customCommandsContent,
        'Commands to ' + context.initialInput,
      );
      const result = await multillama.useModel(modelJson, [
        { role: 'user', content: message },
      ]);
      const jsonResponse = JSON.parse(result);
      const commandsList = jsonResponse.commands || [];
      context.data['commandsList'] = commandsList;
      return commandsList.length > 0;
    },
  );

  const showCommandOptionsStep = pipeline.addStep(
    async (input: any, context: PipelineContext<string>): Promise<any> => {
      context.successSpinner('');
      await showCommandOptions(context.data['commandsList']);
    },
  );

  const searchCommandStep = pipeline.addStep(async (input, context) => {
    const message = generateOtherCommands(context.initialInput);
    return await multillama.useModel(modelJson, [
      { role: 'user', content: message },
    ]);
  });

  const showNewCommandsStep = pipeline.addStep(
    async (input: any, context: PipelineContext<string>): Promise<any> => {
      const jsonResponse = JSON.parse(input);
      const commandsList = jsonResponse.commands || [];
      context.successSpinner('');
      await showCommandOptions(commandsList);
    },
  );

  searchCommandStep.nextNode = showNewCommandsStep;

  pipeline.addBranch(commandQuestionStep, true, showCommandOptionsStep);
  pipeline.addBranch(commandQuestionStep, false, searchCommandStep);
}
