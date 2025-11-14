import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { Specialist } from '@shared/types';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ChatContext {
  specialist: Specialist;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  userMessage: string;
  attachments?: Array<{
    type: string;
    url: string;
  }>;
}

/**
 * Generate AI response using OpenAI (without ebooks)
 */
async function generateOpenAIResponse(context: ChatContext): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: context.specialist.system_prompt,
    },
    ...context.conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    {
      role: 'user',
      content: context.userMessage,
    },
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    temperature: 0.8,
    max_tokens: 1000,
  });

  return completion.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';
}

/**
 * Generate AI response using OpenAI with ebooks (Prompt ID)
 */
async function generateOpenAIEbooksResponse(context: ChatContext): Promise<string> {
  const promptId = process.env.OPENAI_PROMPT_ID;

  if (!promptId) {
    console.warn('OPENAI_PROMPT_ID not set, falling back to regular OpenAI');
    return generateOpenAIResponse(context);
  }

  try {
    // Build conversation history
    const conversationText = context.conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : context.specialist.name}: ${msg.content}`)
      .join('\n\n');

    const fullPrompt = `${context.specialist.system_prompt}

Previous conversation:
${conversationText}

User's new message: ${context.userMessage}

Please respond as ${context.specialist.name}, using the knowledge from the RELOVE ebooks to provide informed, compassionate guidance.`;

    // Use the prompt with completion API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: fullPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';
  } catch (error) {
    console.error('Error with OpenAI ebooks:', error);
    return generateOpenAIResponse(context);
  }
}

/**
 * Generate AI response using Claude (Anthropic)
 */
async function generateClaudeResponse(context: ChatContext): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    ...context.conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    {
      role: 'user',
      content: context.userMessage,
    },
  ];

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: context.specialist.system_prompt,
    messages,
  });

  const textContent = response.content.find(block => block.type === 'text');
  return textContent && 'text' in textContent
    ? textContent.text
    : 'I apologize, but I encountered an error. Please try again.';
}

/**
 * Main function to generate AI response based on specialist's provider
 */
export async function generateAIResponse(context: ChatContext): Promise<string> {
  try {
    switch (context.specialist.ai_provider) {
      case 'openai':
        return await generateOpenAIResponse(context);

      case 'openai_ebooks':
        return await generateOpenAIEbooksResponse(context);

      case 'claude':
        return await generateClaudeResponse(context);

      default:
        throw new Error(`Unknown AI provider: ${context.specialist.ai_provider}`);
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
}

/**
 * Analyze screenshot image using OpenAI Vision
 */
export async function analyzeScreenshot(imageUrl: string, userContext: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this screenshot in the context of relationship recovery. The user says: "${userContext}".

              Please provide:
              1. What you see in the screenshot
              2. Analysis of the communication style
              3. Recommendations for improvement
              4. Red flags or positive signs`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 800,
    });

    return completion.choices[0]?.message?.content || 'Unable to analyze the screenshot.';
  } catch (error) {
    console.error('Error analyzing screenshot:', error);
    throw new Error('Failed to analyze screenshot. Please try again.');
  }
}
