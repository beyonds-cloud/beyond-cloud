import { type NextRequest, NextResponse } from "next/server";
import { env } from "../../../env.js";

const GOOGLE_MAPS_API_KEY = env.GOOGLE_MAPS_SERVER_KEY;
const PROJECT_ID = "onyx-robot-451205-n3";
const LOCATION_ID = "us-central1";
const API_ENDPOINT = "us-central1-aiplatform.googleapis.com";
const MODEL_ID = "gemini-2.0-flash-001";
const GENERATE_CONTENT_API = "generateContent";

interface LocationParams {
  latitude: number;
  longitude: number;
  heading?: number;
  pitch?: number;
  promptAdditions?: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface GeminiPart {
  text?: string;
  [key: string]: unknown;
}

interface GeminiContent {
  parts?: GeminiPart[];
  [key: string]: unknown;
}

interface GeminiCandidate {
  content?: GeminiContent;
  [key: string]: unknown;
}

interface VertexAIResponse {
  candidates?: GeminiCandidate[];
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude, heading, pitch, promptAdditions } =
      (await request.json()) as LocationParams;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Missing required location parameters" },
        { status: 400 },
      );
    }

    // 1. Fetch the street view image
    // Use exact 16:9 dimensions for consistency with the generated image
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=1024x576&location=${latitude},${longitude}&heading=${heading ?? 0}&pitch=${pitch ?? 0}&key=${GOOGLE_MAPS_API_KEY}`;

    const imageResponse = await fetch(streetViewUrl);

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch street view image" },
        { status: 500 },
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    // 2. Prepare the request for Vertex AI
    // Base prompt
    let promptText =
      'You are a "detailed image describer." Your task is to analyze an image of a location and provide a very detailed description, including every part of the image and specifying the location of each element within the image (e.g., top left corner, center, bottom right, etc.). ignore any ui elements, be very descriptive, include things like which way we are facing, which way the roads are going and such, include detailed colours of important features and elements.';

    // Add any prompt additions if provided
    if (promptAdditions?.trim()) {
      promptText +=
        " the following is the twist, incorporate it into every part of the description in some way: " +
        promptAdditions.trim();
    }

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 1,
        maxOutputTokens: 8192,
        topP: 0.95,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    // 3. Call Vertex AI API
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Failed to get access token" },
        { status: 500 },
      );
    }

    console.log("Making Vertex AI request");

    const vertexUrl = `https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/publishers/google/models/${MODEL_ID}:${GENERATE_CONTENT_API}`;
    console.log("Vertex URL:", vertexUrl);

    const vertexResponse = await fetch(vertexUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    // Check if response was successful
    if (!vertexResponse.ok) {
      const errorBody = await vertexResponse.text();
      console.error("Vertex API error response:", errorBody);
      return NextResponse.json({
        image: `data:image/jpeg;base64,${base64Image}`,
        error: `Vertex API error: ${vertexResponse.status} ${vertexResponse.statusText}`,
        errorDetails: errorBody,
      });
    }

    // 4. Return the result
    const aiResponse = (await vertexResponse.json()) as VertexAIResponse;
    console.log("Vertex API response:", JSON.stringify(aiResponse));

    // Process the response before sending it back
    let processedResponse;
    try {
      if (
        aiResponse.candidates &&
        Array.isArray(aiResponse.candidates) &&
        aiResponse.candidates.length > 0
      ) {
        const candidate = aiResponse.candidates[0];
        if (
          candidate?.content?.parts &&
          Array.isArray(candidate.content.parts)
        ) {
          processedResponse = {
            image: `data:image/jpeg;base64,${base64Image}`,
            description: {
              candidates: [
                {
                  content: {
                    parts: candidate.content.parts,
                  },
                },
              ],
            },
          };
        } else {
          processedResponse = {
            image: `data:image/jpeg;base64,${base64Image}`,
            description: {
              error: "Invalid response structure: missing content or parts",
            },
          };
        }
      } else {
        processedResponse = {
          image: `data:image/jpeg;base64,${base64Image}`,
          description: {
            error: "Invalid response structure: missing candidates",
          },
        };
      }
    } catch (processingError) {
      console.error("Error processing AI response:", processingError);
      processedResponse = {
        image: `data:image/jpeg;base64,${base64Image}`,
        description: {
          error: "Error processing AI response",
        },
        rawResponse: aiResponse,
      };
    }

    return NextResponse.json(processedResponse);
  } catch (error) {
    // Log the error for debugging but don't expose it
    console.error("Error generating description:", error);

    return NextResponse.json(
      { error: "Failed to generate description. Please try again." },
      { status: 500 },
    );
  }
}

// Helper function to get Google Cloud access token
async function getAccessToken(): Promise<string | null> {
  try {
    // Check if we're running in a Google Cloud environment
    try {
      const response = await fetch(
        "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
        {
          headers: {
            "Metadata-Flavor": "Google",
          },
        },
      );

      if (response.ok) {
        const data = (await response.json()) as TokenResponse;
        return data.access_token;
      }
    } catch (error) {
      console.log(
        "Not running in Google Cloud environment, using local credentials",
      );
    }

    // If not running in Google Cloud, try to use local credentials via exec
    if (typeof window === "undefined") {
      try {
        // Use dynamic import instead of require
        const { exec } = await import("child_process");

        return new Promise<string | null>((resolve, reject) => {
          exec(
            "gcloud auth print-access-token",
            (error: Error | null, stdout: string, stderr: string) => {
              if (error) {
                console.error(`Error getting access token: ${error.message}`);
                reject(error);
                return;
              }
              if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(new Error(stderr));
                return;
              }

              resolve(stdout.trim());
            },
          );
        });
      } catch (importError) {
        console.error("Failed to import child_process:", importError);
      }
    }

    console.error("Failed to get Google Cloud access token");
    return null;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}
