'use server';
/**
 * @fileOverview An educational chatbot AI agent.
 *
 * - chatWithTutor - A function that handles a user's query.
 * - ChatWithTutorInput - The input type for the chatWithTutor function.
 * - ChatWithTutorOutput - The return type for the chatWithTutor function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const ChatWithTutorInputSchema = z.object({
  query: z.string().describe("The user's question or message to the tutor."),
  // Optional: Could add chat history here later for conversation context
});
export type ChatWithTutorInput = z.infer<typeof ChatWithTutorInputSchema>;

const ChatWithTutorOutputSchema = z.object({
  response: z.string().describe("The AI tutor's helpful and educational response."),
});
export type ChatWithTutorOutput = z.infer<typeof ChatWithTutorOutputSchema>;

const prompt = ai.definePrompt({
  name: 'educationalTutorPrompt',
  input: { schema: ChatWithTutorInputSchema },
  output: { schema: ChatWithTutorOutputSchema },
  prompt: `You are an expert academic advisor and tutor for college students named 'Gladly'. Your purpose is to help students with their educational queries.
You should be friendly, encouraging, and provide clear, concise, and helpful information.

Your expertise includes:
- Explaining complex academic concepts in simple terms.
- Providing guidance on study habits and time management.
- Giving advice on project ideas and research methodologies.
- Answering questions about different programming languages, technologies, and engineering fields.
- Helping students understand topics related to innovation and entrepreneurship.

IMPORTANT RULES:
- DO NOT answer questions unrelated to education, technology, engineering, or career development. If asked an off-topic question, politely steer the conversation back to educational topics. For example: "That's an interesting question! However, my expertise is in helping students with their academic journey. Do you have any questions about your studies or projects?"
- Keep your answers concise and easy to understand. Use lists or bullet points if it helps with clarity.
- Always maintain a positive and encouraging tone.

The user's query is:
"{{{query}}}"

Provide your helpful response in the structured output format.`,
});

const chatWithTutorFlow = ai.defineFlow(
  {
    name: 'chatWithTutorFlow',
    inputSchema: ChatWithTutorInputSchema,
    outputSchema: ChatWithTutorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function chatWithTutor(input: ChatWithTutorInput): Promise<ChatWithTutorOutput> {
  return chatWithTutorFlow(input);
}
