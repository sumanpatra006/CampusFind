// 'use server';
/**
 * @fileOverview Category suggestion AI agent.
 *
 * - suggestCategory - A function that suggests a category for a lost or found item based on the description.
 * - SuggestCategoryInput - The input type for the suggestCategory function.
 * - SuggestCategoryOutput - The return type for the suggestCategory function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCategoryInputSchema = z.object({
  description: z
    .string()
    .describe('The description of the lost or found item.'),
});
export type SuggestCategoryInput = z.infer<typeof SuggestCategoryInputSchema>;

const SuggestCategoryOutputSchema = z.object({
  category: z.string().describe('The suggested category for the item.'),
});
export type SuggestCategoryOutput = z.infer<typeof SuggestCategoryOutputSchema>;

export async function suggestCategory(input: SuggestCategoryInput): Promise<SuggestCategoryOutput> {
  return suggestCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCategoryPrompt',
  input: {schema: SuggestCategoryInputSchema},
  output: {schema: SuggestCategoryOutputSchema},
  prompt: `You are a helpful assistant that suggests a category for a lost or found item based on the description.

Description: {{{description}}}

Suggest a category for this item:
`,
});

const suggestCategoryFlow = ai.defineFlow(
  {
    name: 'suggestCategoryFlow',
    inputSchema: SuggestCategoryInputSchema,
    outputSchema: SuggestCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
