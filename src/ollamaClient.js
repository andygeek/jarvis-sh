import ollama from 'ollama';

export async function askModel({ model, messages, format }) {
  try {
    const response = await ollama.chat({
      model,
      messages,
      format,
    });

    return response.message.content.trim();
  } catch (error) {
    if (error.message.includes('model') && error.message.includes('not found')) {
      console.error(
        `The model "${model}" is not installed in Ollama. Please install this model before using it.`
      );
      return null;
    } else {
      console.error('Error processing the request:', error);
      return null;
    }
  }
}

export async function askModelStream({ model, messages }) {
  try {
    const responseGenerator = await ollama.chat({
      model,
      messages,
      stream: true,
    });

    return responseGenerator;
  } catch (error) {
    if (error.message.includes('model') && error.message.includes('not found')) {
      console.error(
        `The model "${model}" is not installed in Ollama. Please install this model before using it.`
      );
      return null;
    } else {
      console.error('Error processing the request:', error);
      return null;
    }
  }
}
