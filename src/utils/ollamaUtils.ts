import ollama from 'ollama';

export async function listOllamaModels(): Promise<string[]> {
  try {
    const models = await ollama.list();
    return models.models.map((model: any) => model.name);
  } catch (err) {
    console.error('Error listing Ollama models:', err);
    return [];
  }
}
