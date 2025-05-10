import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
import { MessagesAnnotation } from '@langchain/langgraph';

const createModel = () =>
  new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    maxRetries: 2,
    temperature: 0,
  });

/* const createTemplate = () => ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are a helpful assistant that guides users on topics.
     The students are eager learners, and you must love guiding them toward a great experience.`,
  ],
  ['human', '{messages}'],
]); */

export const callAI = async (
  state: typeof MessagesAnnotation.State,
) => {
  /*   const template = createTemplate(); */
  const model = createModel();

  /*   const prompt = await template.invoke(state); */
  const response = await model.invoke(state.messages);
  return { messages: [response] };
};