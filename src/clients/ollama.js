import ollama from 'ollama';
import { getModel } from '../utils.js';

/**
 * Function to send a message to the Ollama model and return the response.
 * 
 * @param {Object} params - The parameters for the request.
 * @param {Array} params.messages - An array of message objects to send to the model.
 * @returns {Promise<string|null>} - The model's response message content, or `null` if an error occurs.
 */
export async function askModel({ messages }) {
  try {
    const model = getModel();  // Get the model from utils.js

    const response = await ollama.chat({
      model,
      messages,
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
 * @param {Array} params.messages - An array of message objects to send to the model.
 * @returns {Promise<AsyncGenerator|null>} - An async generator yielding the streaming response 
 *                                           from the model, or `null` if an error occurs.
 */
export async function askModelStream({ messages }) {
  try {
    const model = getModel();  // Get the model from utils.js

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

/**
 * Function to send a message to the Ollama model and return the response in JSON format.
 * 
 * @param {Object} params - The parameters for the request.
 * @param {Array} params.messages - An array of message objects to send to the model.
 * @returns {Promise<string|null>} - The model's response message content as JSON, or `null` if an error occurs.
 */
export async function askModelJson({ messages }) {
  try {
    const model = getModel();  // Get the model from utils.js

    const response = await ollama.chat({
      model,
      messages,
      format: 'json',
    });

    return response.message.content.trim();
  } catch (error) {
    console.error('Error processing the request:', error);
    return null;
  }
}
