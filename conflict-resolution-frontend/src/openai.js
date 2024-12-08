import OpenAI from 'openai';

console.log("API Key:", process.env.REACT_APP_OPENAI_API_KEY);

export const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});