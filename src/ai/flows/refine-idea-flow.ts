
'use server';
/**
 * @fileOverview An AI agent to refine and analyze student ideas.
 *
 * - refineIdea - A function that takes a user's idea and provides structured feedback.
 * - RefineIdeaInput - The input type for the refineIdea function.
 * - RefineIdeaOutput - The return type for the refineIdea function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const RefineIdeaInputSchema = z.object({
  title: z.string().describe('The title of the idea.'),
  description: z.string().describe('The current, user-written description of the idea.'),
});
export type RefineIdeaInput = z.infer<typeof RefineIdeaInputSchema>;

const RefineIdeaOutputSchema = z.object({
  refinedDescription: z.string().describe("An improved, professionally structured version of the user's idea description."),
  suggestedTags: z.array(z.string()).describe('A list of 3-5 relevant keywords or tags for the idea.'),
  potentialChallenges: z.string().describe('A brief summary of 2-3 potential challenges or questions the user should consider.'),
});
export type RefineIdeaOutput = z.infer<typeof RefineIdeaOutputSchema>;


const prompt = ai.definePrompt({
  name: 'refineIdeaPrompt',
  input: { schema: RefineIdeaInputSchema },
  output: { schema: RefineIdeaOutputSchema },
  prompt: `You are an expert startup mentor and business analyst. A student has submitted an idea for a project or startup.
Your task is to analyze their initial submission and help them improve it.

Carefully review the user's idea title and description.
1.  Rewrite the description to be more professional, clear, and structured. Frame it as a concise pitch.
2.  Based on the idea, generate a list of 3-5 relevant tags or keywords that would help categorize this project (e.g., "AI", "Sustainability", "EdTech", "Healthcare").
3.  Identify 2-3 potential challenges or key questions the student should think about to further develop their idea. This should be constructive feedback to prompt deeper thinking.

Here is the student's idea:
Title: {{{title}}}
Description: {{{description}}}

Provide your analysis in the structured output format.`,
});

const refineIdeaFlow = ai.defineFlow(
  {
    name: 'refineIdeaFlow',
    inputSchema: RefineIdeaInputSchema,
    outputSchema: RefineIdeaOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function refineIdea(input: RefineIdeaInput): Promise<RefineIdeaOutput> {
  return refineIdeaFlow(input);
}
