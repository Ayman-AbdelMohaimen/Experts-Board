import { generateGenericText } from './geminiService';

/**
 * NOTE FOR BACKEND DEVELOPER:
 * This function is a placeholder for a unified API endpoint (e.g., /api/generate).
 * The frontend will send the prompt, systemInstruction, and modelId to this endpoint.
 * The backend should then route the request to the correct LLM provider.
 * For Huawei Cloud models (Qwen, DeepSeek), you will need to implement a handler
 * that uses the Huawei Cloud Python SDK as shown in the documentation provided.
 * Example: https://competition.intl.huaweicloud.com/intl/en-us/information/1201724797/LLM
 */
const callHuaweiCloudModel = async (modelId: string, prompt: string, systemInstruction: string): Promise<string> => {
    // This is a mocked response.
    // In a real implementation, you would make a fetch() call to your backend endpoint.
    console.log(`[Mock API Call] Model: ${modelId}, Prompt: ${prompt}, System Instruction: ${systemInstruction}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    return `This is a mocked response from the ${modelId} model.
    
Original Prompt: "${prompt}"

To see a real response, a backend service needs to be implemented to securely call the Huawei Cloud API. This service would receive the model ID and prompt from the frontend and return the model's generation.`;
};

export const generateText = async (
    systemInstruction: string, 
    userPrompt: string, 
    modelId: string
): Promise<string> => {
    switch (modelId) {
        case 'gemini-2.5-flash':
        case 'gemini-2.5-pro':
            // For Gemini models, we can call the client-side SDK directly.
            // Note: The specific model isn't passed to generateGenericText because it's hardcoded there.
            // A future improvement would be to pass the modelId to the Gemini service as well.
            return generateGenericText(systemInstruction, userPrompt);
        
        case 'qwen3-32b':
        case 'deepseek-v3.1':
            // For other models like those on Huawei Cloud, we need to call our backend.
            // The backend will then use its credentials to call the provider's API.
            return callHuaweiCloudModel(modelId, userPrompt, systemInstruction);
        
        default:
            throw new Error(`Unsupported model: ${modelId}`);
    }
};
