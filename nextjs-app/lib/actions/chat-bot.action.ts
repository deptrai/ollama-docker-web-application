"use server";

import { URL_BACKEND } from "./const";

interface ChatBotResponse {
  answer: string;
  data_db: any;
  evaluation: string;
}

interface ChatBotRequest {
  context?: string;
  file_path?: string;
  prompt: string;
  temperature?: number;
  top_k?: number;
  top_p?: number;
  num_ctx?: number;
  num_predict?: number;
  repeat_last_n?: number;
  repeat_penalty?: number;
}

export async function askChatBot(data: ChatBotRequest): Promise<ChatBotResponse> {
  try {
    const response = await fetch(`${URL_BACKEND}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        context: data.context || "",
        file_path: data.file_path || "",
        prompt: data.prompt,
        temperature: data.temperature || 0.1,
        top_k: data.top_k || 10,
        top_p: data.top_p || 0.95,
        num_ctx: data.num_ctx || 2048,
        num_predict: data.num_predict || 200,
        repeat_last_n: data.repeat_last_n || 64,
        repeat_penalty: data.repeat_penalty || 1.15
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result as ChatBotResponse;
  } catch (error) {
    console.error("Error calling chat bot:", error);
    throw error;
  }
}
