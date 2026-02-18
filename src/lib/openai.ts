import OpenAI from "openai";

let client: OpenAI | null = null;

/** OpenAI 클라이언트 싱글톤. API 키 없으면 null 반환 */
export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}
