import { callAI } from "../AI-nodes/startNode.js";
import { AIMessage } from "@langchain/core/messages";
import { MessagesAnnotation, START, END, StateGraph } from "@langchain/langgraph";

// export const shouldContinue = ({ messages }: typeof MessagesAnnotation.State) => {
//   const lastMessage = messages[messages.length - 1] as AIMessage;
//   return lastMessage.tool_calls?.length ? 'tools' : '__end__';
// };

export const createFlow = () => {
  return new StateGraph(MessagesAnnotation)
    .addNode('model', callAI)
    .addEdge(START, 'model')
    .addEdge('model', END);
};