import { Injectable } from '@nestjs/common';

type MODEL = 'gpt-3.5-turbo' | 'gpt-3.5' | 'gpt-4' | 'gpt-4o' | 'gpt-4-turbo';

export type Prompt = {
  role: 'user' | 'assistant' | 'system';
} & (
  | {
      content: string;
    }
  | {
      content: (
        | {
            type: 'text';
            text: string;
          }
        | {
            type: 'image_url';
            image_url: {
              url: string;
            };
          }
      )[];
    }
);

export type Prompts = Prompt[];

@Injectable()
export class ChatgptService {
  API_URL = 'https://api.openai.com/v1/chat/completions';

  async sendMessage(messages: Prompts, model: MODEL) {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    });

    const data = await response.json();
    return data?.choices[0]?.message?.content || null;
  }
}
