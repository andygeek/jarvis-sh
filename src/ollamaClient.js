import ollama from 'ollama';

/**
 * Function to send a formatted message to a specified model in Ollama and return the response.
 * 
 * @param {Object} params - The parameters for the request.
 * @param {string} params.model - The model name to use in Ollama.
 * @param {Array} params.messages - An array of message objects to send to the model.
 * @param {string} params.format - The format for the response output.
 * @returns {Promise<string|null>} - The model's response message content, or `null` if an error occurs.
 * 
 * This function attempts to retrieve a response from the specified model using `ollama.chat()`. 
 * If the model is not installed, it logs a relevant message. If Ollama is not running, it logs a 
 */
export async function askModel({ model, messages, format }) {
  try {
    const response = await ollama.chat({
      model,
      messages,
      format,
    });

    return response.message.content.trim();
  } catch (error) {
    if (
      error.message.includes('model') &&
      error.message.includes('not found')
    ) {
      console.error(
        `The model "${model}" is not installed in Ollama. Please install this model before using it.`
      );
      return null;
    } else if (
      error.cause &&
      error.cause.code === 'ECONNREFUSED'
    ) {
      console.error('Ollama is not initialized.');
      return null;
    } else {
      console.error('Error processing the request:', error);
      return null;
    }
  }
}

/**
 * Function to send a message to a model in Ollama and retrieve a streaming response.
 * 
 * @param {Object} params - The parameters for the request.
 * @param {string} params.model - The model name to use in Ollama.
 * @param {Array} params.messages - An array of message objects to send to the model.
 * @returns {Promise<AsyncGenerator|null>} - An async generator yielding the streaming response 
 *                                           from the model, or `null` if an error occurs.
 * 
 * This function sends a message to the specified model in streaming mode. It uses `ollama.chat()` 
 * with the `stream` option set to `true`. If the model is not installed, it logs an error message. 
 */
export async function askModelStream({ model, messages }) {
  try {
    const responseGenerator = await ollama.chat({
      model,
      messages,
      stream: true,
    });

    return responseGenerator;
  } catch (error) {
    if (
      error.message.includes('model') &&
      error.message.includes('not found')
    ) {
      console.error(
        `The model "${model}" is not installed in Ollama. Please install this model before using it.`
      );
      return null;
    } else if (
      error.cause &&
      error.cause.code === 'ECONNREFUSED'
    ) {
      console.error('Ollama is not initialized.');
      return null;
    } else {
      console.error('Error processing the request:', error);
      return null;
    }
  }
}
