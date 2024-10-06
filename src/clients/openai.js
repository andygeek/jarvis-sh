import OpenAI from 'openai';
import { getServiceApiKey, getModel } from '../utils.js';

/**
 * Function to send a message to OpenAI's model and return the response.
 * 
 * @param {Object} params - The parameters for the request.
 * @param {Array} params.messages - An array of message objects to send to the model.
 * @returns {Promise<string|null>} - The model's response as a string, or `null` if an error occurs.
 */
export async function askModel({ messages }) {
  try {
    const openai = new OpenAI({ apiKey: getServiceApiKey() });
    const model = getModel();

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return response.choices[0]?.message?.content.trim() || null;
  } catch (error) {
    console.error('Error processing the request:', error);
    return null;
  }
}

/**
 * Function to send a message to OpenAI's model and retrieve a streaming response.
 * 
 * @param {Object} params - The parameters for the request.
 * @param {Array} params.messages - An array of message objects to send to the model.
 * @returns {Promise<AsyncGenerator|null>} - An async generator yielding the streaming response
 *                                           from the model, or `null` if an error occurs.
 */
export async function askModelStream({ messages }) {
  try {
    const openai = new OpenAI({ apiKey: getServiceApiKey() });
    const model = getModel();

    const stream = await openai.chat.completions.create({
      model,
      messages,
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error('Error processing the request:', error);
    return null;
  }
}

/**
 * Function to send a message to OpenAI's model and return the response in JSON format.
 * 
 * @param {Object} params - The parameters for the request.
 * @param {Array} params.messages - An array of message objects to send to the model.
 * @returns {Promise<string|null>} - The model's response as a JSON string, or `null` if an error occurs.
 */
export async function askModelJson({ messages }) {
  try {
    const openai = new OpenAI({ apiKey: getServiceApiKey() });
    const model = getModel();

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: {
        "type": "json_object"
      },
    });

    return response.choices[0]?.message?.content.trim() || null;
  } catch (error) {
    console.error('Error processing the request:', error);
    return null;
  }
}
