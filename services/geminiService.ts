import { GoogleGenAI, Type, type Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION, ADVANCE_TIME_PROMPT } from '../constants';
import type { CameraEvent, GeminiResponse } from '../types';
import type { MapArea } from "../data/mapData";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    events: {
      type: Type.ARRAY,
      description: "A list of 2 to 5 new surveillance events.",
      items: {
        type: Type.OBJECT,
        properties: {
          camera: {
            type: Type.STRING,
            description: "The location of the camera feed.",
          },
          timestamp: {
            type: Type.STRING,
            description: "The timestamp of the event, e.g., '23:17:04'.",
          },
          message: {
            type: Type.STRING,
            description: "A short, cryptic message describing the observation in Spanish.",
          },
          priority: {
            type: Type.STRING,
            description: "The priority of the event: 'LOW', 'MEDIUM', or 'HIGH'.",
          },
          personnel: {
            type: Type.ARRAY,
            description: "Array of key personnel involved. e.g., ['Dr. Aris Thorne']. Empty if none.",
            items: { type: Type.STRING }
          },
          anomalies: {
            type: Type.ARRAY,
            description: "Array of SCPs involved. e.g., ['SCP-173']. Empty if none.",
            items: { type: Type.STRING }
          },
          imageId: {
            type: Type.INTEGER,
            description: "Optional. An ID from 0 to 9 to attach a corresponding pre-set corrupted image to the event. Use for visually significant events.",
          },
        },
        required: ["camera", "timestamp", "message", "priority", "personnel", "anomalies"],
      },
    },
  },
  required: ["events"],
};


export const initializeChat = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.9,
    },
  });
};

export const getNextEvents = async (chat: Chat, userAction?: string | null): Promise<CameraEvent[]> => {
  try {
    const prompt = userAction 
      ? `USER ACTION: ${userAction}\n${ADVANCE_TIME_PROMPT}`
      : ADVANCE_TIME_PROMPT;
      
    const response = await chat.sendMessage({ message: prompt });
    
    if (!response.text) {
        console.error("Gemini API returned an empty response text.");
        throw new Error("Received no data from IRIS.");
    }

    // Sanitize the response text before parsing
    const cleanedJsonString = response.text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed: GeminiResponse = JSON.parse(cleanedJsonString);
    
    if (!parsed.events || !Array.isArray(parsed.events)) {
      console.error("Parsed JSON does not match expected schema:", parsed);
      throw new Error("Received malformed data from IRIS.");
    }
    
    return parsed.events;
  } catch (error) {
    console.error("Error fetching or parsing next events:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse surveillance data from IRIS. The data might be corrupted.");
    }
    throw error; // Re-throw other errors
  }
};
