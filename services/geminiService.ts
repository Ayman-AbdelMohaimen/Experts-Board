import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import type { AnalysisResult, CourseOutline, SuggestionCategory } from '../types';
import { Language } from "../App";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const initialAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        profile: {
            type: Type.OBJECT,
            properties: {
                titlePrefix: { type: Type.STRING, description: "The honorific prefix before the name (e.g., Eng., Dr., Prof.). Leave empty if not found in the CV." },
                name: { type: Type.STRING, description: "The expert's full name." },
                title: { type: Type.STRING, description: "The expert's current job title." },
                summary: { type: Type.STRING, description: "A 3-4 sentence professional summary of the expert's experience and capabilities." },
                skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of key technical and soft skills." },
                links: { 
                    type: Type.OBJECT,
                    description: "An object containing important professional links. Leave the field empty if a link is not found.",
                    properties: {
                        linkedin: { type: Type.STRING, description: "Link to LinkedIn profile." },
                        github: { type: Type.STRING, description: "Link to GitHub profile." },
                        website: { type: Type.STRING, description: "Link to personal website or blog." },
                        twitter: { type: Type.STRING, description: "Link to Twitter (X) profile." },
                    }
                },
                profilePicture: { type: Type.STRING, description: "Always leave this field empty. The profile picture will be handled on the client side." },
                services: {
                    type: Type.ARRAY,
                    description: "A list of professional services the expert can offer based on their experience (e.g., consulting, training, contracting). Suggest 3-5 services.",
                    items: { type: Type.STRING }
                },
                products: {
                    type: Type.ARRAY,
                    description: "A list of digital products the expert could create (e.g., courses, books). Suggest 2-3 products.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "The name of the suggested product." },
                            type: { type: Type.STRING, description: "The type of product, e.g., 'Training Course' or 'E-book'." },
                            price: { type: Type.STRING, description: "A suggested price, which can be 'Free' or 'To be determined'." },
                            description: { type: Type.STRING, description: "A brief description of the product." },
                            link: { type: Type.STRING, description: "Leave this field empty." }
                        },
                        required: ['name', 'type', 'description']
                    }
                }
            }
        },
        timeline: {
            type: Type.ARRAY,
            description: "A timeline showing the professional career and experiences in reverse chronological order.",
            items: {
                type: Type.OBJECT,
                properties: {
                    year: { type: Type.STRING, description: "The year or period of the event." },
                    title: { type: Type.STRING, description: "The job title or event name." },
                    company: { type: Type.STRING, description: "The name of the company or organization." },
                    description: { type: Type.STRING, description: "A brief description of achievements and responsibilities during this period." }
                }
            }
        },
        atsCv: {
            type: Type.OBJECT,
            description: "A professional resume compatible with Applicant Tracking Systems (ATS).",
            properties: {
                contact: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        phone: { type: Type.STRING },
                        email: { type: Type.STRING },
                        linkedin: { type: Type.STRING, description: "LinkedIn profile URL if available." }
                    }
                },
                summary: { type: Type.STRING, description: "A professional summary for the resume." },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                experience: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            company: { type: Type.STRING },
                            dates: { type: Type.STRING, description: "Example: 'June 2020 - Present'" },
                            responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                },
                education: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            degree: { type: Type.STRING },
                            institution: { type: Type.STRING },
                            year: { type: Type.STRING }
                        }
                    }
                }
            }
        },
        courseOutline: {
            type: Type.OBJECT,
            description: "A comprehensive educational course structure based on the expert's experience.",
            properties: {
                courseTitle: { type: Type.STRING, description: "An engaging and suitable title for the course." },
                description: { type: Type.STRING, description: "A general description of the course and its outcomes." },
                modules: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: "The title of the educational module." },
                            objectives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The measurable learning objectives for this module." },
                            topics: {
                                type: Type.ARRAY,
                                description: "The detailed topics within the module.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING, description: "The title of the topic." },
                                        content: { type: Type.STRING, description: "Leave empty. This will be generated by AI later." }
                                    },
                                    required: ['title']
                                }
                            },
                            activities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggested interactive learning activities and workshops." }
                        }
                    }
                }
            }
        }
    }
};


export const analyzeExpertData = async (analysisContent: string, imageParts: any[], language: Language): Promise<AnalysisResult> => {
    const languageInstruction = language === 'ar'
        ? 'يجب أن تكون جميع المخرجات باللغة العربية.'
        : 'All outputs must be in English.';

    const systemInstruction = `You are an AI expert specializing in instructional design and career development. Your task is to meticulously analyze the provided content, which is a compilation of text from CV files, images, and links. The content is structured with headers like "--- File Content 1 (cv.pdf) ---" to separate different sources. You must carefully extract and synthesize information from ALL provided sources to generate a comprehensive and accurate set of professional outputs.
**Core Instructions:**
1.  **Strict Adherence to Schema:** Generate a single JSON object that strictly follows the provided schema.
2.  **No Hallucination:** If any information required by the schema (e.g., phone number, GitHub link) is not present in ANY of the provided sources, you MUST leave its corresponding field empty (e.g., "" or []). DO NOT invent or assume any information.
3.  **Data Synthesis:** If multiple files provide conflicting information (e.g., different job titles for the same period), prioritize the information from the most recent or detailed source.
4.  **Comprehensive Extraction:** Ensure all key sections like professional summary, skills, experience, and education are populated as thoroughly as possible from the text.
5.  **Service & Product Suggestions:** Based on the expert's complete profile, suggest 3-5 professional services and 2-3 digital products (like courses or e-books) they could create.
6.  **JSON Formatting:** Pay close attention to escaping any double quotation marks (") within string values using a backslash (\\).
${languageInstruction}`;
    
    const userPrompt = `
    Analyze the following content compiled from the expert's files (text and images) and links:
    ---
    ${analysisContent}
    ---
    `;

    const requestParts: any[] = [{ text: userPrompt }, ...imageParts];

    let response: GenerateContentResponse | undefined;
    try {
        response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: { parts: requestParts },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: initialAnalysisSchema,
            },
        });
        
        let jsonText = response.text.trim();
        
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.slice(7, -3).trim();
        } else if (jsonText.startsWith("```")) {
            jsonText = jsonText.slice(3, -3).trim();
        }

        const result = JSON.parse(jsonText);
        
        if (!result.profile.services) result.profile.services = [];
        if (!result.profile.products) result.profile.products = [];
        
        return result as AnalysisResult;

    } catch (error) {
        console.error("Gemini API Error:", error);
        if (response?.text) {
            console.error("Problematic JSON text that failed to parse:", response.text);
        }
        throw new Error("Failed to process data with Gemini API.");
    }
};

const suggestionCategorySchema = {
    type: Type.OBJECT,
    properties: {
        category: { type: Type.STRING, description: "The name of the suggestion category (e.g., 'Formative Assessments', 'Content Enhancement')." },
        emoji: { type: Type.STRING, description: "A single, relevant emoji for the category." },
        suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of specific suggestions within this category." }
    },
    required: ['category', 'emoji', 'suggestions']
};

const developmentPlanSchema = {
    type: Type.OBJECT,
    properties: {
        assessments: {
            type: Type.ARRAY,
            description: "A categorized list of suggestions for assessment mechanisms.",
            items: suggestionCategorySchema
        },
        improvementPlan: {
            type: Type.ARRAY,
            description: "A categorized list of proposals for a continuous improvement plan.",
            items: suggestionCategorySchema
        }
    }
};

export const generateDevelopmentPlan = async (profileData: AnalysisResult, language: Language): Promise<{ assessments: SuggestionCategory[], improvementPlan: SuggestionCategory[] }> => {
    const languageInstruction = language === 'ar'
        ? 'يجب أن يكون الرد باللغة العربية.'
        : 'The response must be in English.';

    const systemInstruction = `You are an expert career and educational consultant. Your task is to analyze the expert's profile data (in JSON format) and provide an actionable development plan. Based on their skills, experience, and proposed course structure, generate: 1. A list of suggested assessment mechanisms for their course. 2. A continuous improvement plan for their professional offerings. For both points, group your suggestions into logical categories. For each category, provide a title, a relevant single emoji, and a list of specific, practical suggestions. The output must be a JSON object following the schema. ${languageInstruction}`;
    
    const userPrompt = `
    This is the expert's data. Analyze it and provide a categorized development plan with emojis:
    ---
    ${JSON.stringify(profileData, null, 2)}
    ---
    `;

    let response: GenerateContentResponse | undefined;
    try {
        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: developmentPlanSchema,
            },
        });

        let jsonText = response.text.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.slice(7, -3).trim();
        }
        
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Gemini Development Plan Error:", error);
        if (response?.text) {
            console.error("Problematic JSON text:", response.text);
        }
        throw new Error("Failed to generate development plan.");
    }
};

const assessmentsOnlySchema = {
    type: Type.OBJECT,
    properties: {
        assessments: {
            type: Type.ARRAY,
            description: "A categorized list of suggestions for assessment mechanisms for the provided course outline.",
            items: suggestionCategorySchema
        }
    },
    required: ['assessments']
};

export const generateAssessmentsForCourse = async (outline: CourseOutline, language: Language): Promise<SuggestionCategory[]> => {
    const languageInstruction = language === 'ar'
        ? 'يجب أن يكون الرد باللغة العربية.'
        : 'The response must be in English.';

    const systemInstruction = `You are an expert instructional designer. Based on the provided course outline (in JSON format), generate a list of suggested assessment mechanisms. Group your suggestions into logical categories (e.g., Formative, Summative, Practical). For each category, provide a title, a relevant single emoji, and a list of specific, practical assessment suggestions. The output must be a JSON object following the schema. ${languageInstruction}`;
    
    const userPrompt = `
    This is the course outline. Analyze it and generate categorized assessment suggestions:
    ---
    ${JSON.stringify(outline, null, 2)}
    ---
    `;
    
    let response: GenerateContentResponse | undefined;
    try {
        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: assessmentsOnlySchema,
            },
        });

        let jsonText = response.text.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.slice(7, -3).trim();
        }
        const result = JSON.parse(jsonText);
        return result.assessments || [];

    } catch (error) {
        console.error("Gemini Assessments Generation Error:", error);
        if (response?.text) {
            console.error("Problematic JSON text:", response.text);
        }
        throw new Error("Failed to generate assessment suggestions.");
    }
};

export const generateTopicContent = async (
    courseTitle: string,
    moduleTitle: string,
    topicTitle: string,
    language: Language
): Promise<string> => {
    const languageInstruction = language === 'ar'
        ? 'يجب أن يكون الرد باللغة العربية. استخدم تنسيق ماركداون للقوائم والعناوين.'
        : 'The response must be in English. Use Markdown for formatting lists and headings.';

    const systemInstruction = `You are an expert instructional designer and subject matter expert. Your task is to generate detailed educational content for a specific topic within a course module. The content should be clear, informative, well-structured, and suitable for learners. Structure your response logically, possibly with an introduction, key points, and a conclusion. ${languageInstruction}`;
    
    const userPrompt = `
    Generate educational content for the following topic.

    Course Title: "${courseTitle}"
    Module Title: "${moduleTitle}"
    Topic to expand upon: "${topicTitle}"

    Please provide a comprehensive, well-structured explanation of the topic.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Topic Content Generation Error:", error);
        throw new Error("Failed to generate topic content.");
    }
};


export const chatWithMedoo = async (
    userPrompt: string,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[],
    userData: { profile: string | null; library: string | null },
    language: Language
): Promise<string> => {
    const languageInstruction = language === 'ar' ? 'Your response must be in Arabic.' : 'Your response must be in English.';

    const systemInstruction = `You are "Medoo", a friendly, cheerful, and helpful AI assistant for the GalaxyEd platform. Your name in Arabic is "ميدوو".
Your goal is to assist the user with their expert profile, course creation, and using the platform's features.
You have access to the user's current profile data and their saved library items. Use this information to provide personalized and accurate answers.
Keep your responses concise, helpful, and maintain a positive and encouraging tone.

**Formatting Rules:**
- Use Markdown for formatting: use \`**bold text**\` for emphasis, and create lists using \`-\` or \`*\`.
- Use relevant emojis (like 👋, ✨, 🚀, 💡) to make the tone friendly and visual.
- Structure your answers with clear paragraphs. Use line breaks to separate ideas and steps.

**Follow-up Questions:**
After your main response, you MUST suggest 2-3 relevant follow-up questions that the **user** might want to ask you next. These suggestions should be phrased from the **user's point of view** as if they are clicking a button to ask.
Format these questions on new lines, each prefixed with "SUGGESTION:". For example:
SUGGESTION: How can I improve my course outline?
SUGGESTION: Can you give me more ideas for my services?
SUGGESTION: Tell me more about the library feature.

${languageInstruction}

Here is the user's data:
<userData>
  <profile>
    ${userData.profile || 'No profile data available.'}
  </profile>
  <library>
    ${userData.library || 'No library items available.'}
  </library>
</userData>
`;

    try {
        const chat: Chat = ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: systemInstruction,
            },
            history: history
        });

        const response: GenerateContentResponse = await chat.sendMessage({ message: userPrompt });
        return response.text;
    } catch (error) {
        console.error("Medoo Chat Error:", error);
        throw new Error("Failed to get a response from Medoo.");
    }
};

export const generateGenericText = async (systemInstruction: string, userPrompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Generic Text Generation Error:", error);
        throw new Error("Failed to generate text content.");
    }
};

export const generateVideo = async (prompt: string, config: any) => {
    // Re-initialize the client to ensure the latest API key is used
    const localAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        let operation = await localAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            config: {
                numberOfVideos: 1,
                ...config
            }
        });
        
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await localAi.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation succeeded but no download link was provided.");
        }

        // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Gemini Video Generation Error:", error);
        throw error;
    }
};
