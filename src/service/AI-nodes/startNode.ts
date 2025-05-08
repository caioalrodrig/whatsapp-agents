import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { MessagesAnnotation } from '@langchain/langgraph';

const createModel = () =>
  new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash',
    temperature: 0,
    maxRetries: 2,
    maxOutputTokens: 2000,
    apiKey: process.env.GEMINI_API_KEY,
  });

/* const createTemplate = () => ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are a helpful assistant that guides users on topics.
     The students are eager learners, and you must love guiding them toward a great experience.`,
  ],
  ['human', '{messages}'],
]); */

export const processMessage = async (
  state: typeof MessagesAnnotation.State,
) => {
  /*   const template = createTemplate(); */
  const model = createModel();

  /*   const prompt = await template.invoke(state); */
  const response = await model.invoke(state.messages);
  return { messages: [response] };
};