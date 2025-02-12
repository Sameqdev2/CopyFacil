import { GoogleGenerativeAI } from '@google/generative-ai';

// Make sure we have an API key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function generateMarketingCopy(productName: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Create a compelling marketing copy for a product called "${productName}". 
                   The copy should be engaging, highlight key benefits, and be around 2-3 paragraphs long. 
                   Focus on creating excitement and value proposition.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (!response.text()) {
      throw new Error('No content generated');
    }
    
    return response.text();
  } catch (error) {
    console.error('Error generating marketing copy:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate marketing copy');
  }
}
