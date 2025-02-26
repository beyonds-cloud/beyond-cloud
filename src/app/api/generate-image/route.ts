import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";

const PROJECT_ID = "onyx-robot-451205-n3";
const LOCATION_ID = "us-central1";
const API_ENDPOINT = "us-central1-aiplatform.googleapis.com";
const MODEL_ID = "imagen-3.0-generate-002";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface RequestParams {
  description: string;
}

interface ImagePrediction {
  mimeType: string;
  bytesBase64Encoded: string;
  prompt?: string;
}

interface ImageGenResponse {
  predictions?: ImagePrediction[];
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user's session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has made a request in the last 10 minutes
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (user?.lastImageRequest) {
      const lastRequest = new Date(user.lastImageRequest);
      const now = new Date();
      const timeDiff = now.getTime() - lastRequest.getTime();
      const minutesDiff = Math.floor(timeDiff / 1000 / 60);
      const timeout = 10;

      if (minutesDiff < timeout) {
        return NextResponse.json(
          { error: `Please wait ${timeout- minutesDiff} minutes before making another request` },
          { status: 429 }
        );
      }
    }

    const { description } = await request.json() as RequestParams;

    if (!description) {
      return NextResponse.json(
        { error: "Missing description" },
        { status: 400 }
      );
    }

    // Update the user's last image request time
    await db.update(users)
      .set({ lastImageRequest: sql`CURRENT_TIMESTAMP` })
      .where(eq(users.id, session.user.id));

    // 1. Get Google Cloud access token
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      return NextResponse.json(
        { error: "Failed to get access token" },
        { status: 500 }
      );
    }

    // 2. Prepare the request for Imagen API
    const requestBody = {
      instances: [
        {
          prompt: description
        }
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: "16:9",
        enhancePrompt: true
      }
    };

    // 3. Call Imagen API
    console.log("Making Imagen API request");
    
    const imageUrl = `https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/publishers/google/models/${MODEL_ID}:predict`;
    console.log("Imagen URL:", imageUrl);
    
    const imageResponse = await fetch(imageUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    });

    // Check if response was successful
    if (!imageResponse.ok) {
      const errorBody = await imageResponse.text();
      console.error("Imagen API error response:", errorBody);
      return NextResponse.json({
        error: `Imagen API error: ${imageResponse.status} ${imageResponse.statusText}`,
        errorDetails: errorBody
      }, { status: 500 });
    }
    
    // 4. Process and return the result
    const generatedResponse = await imageResponse.json() as ImageGenResponse;
    console.log("Imagen API response received");
    
    if (generatedResponse.predictions?.[0]?.mimeType && generatedResponse.predictions[0]?.bytesBase64Encoded) {
      const generatedImage = generatedResponse.predictions[0];
      const enhancedPrompt = generatedImage.prompt ?? description;
      return NextResponse.json({
        image: `data:${generatedImage.mimeType};base64,${generatedImage.bytesBase64Encoded}`,
        enhancedPrompt
      });
    } else {
      return NextResponse.json({
        error: "No valid image generated",
        rawResponse: generatedResponse
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error processing image generation request:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
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
            "Metadata-Flavor": "Google"
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json() as TokenResponse;
        return data.access_token;
      }
    } catch (error) {
      console.log("Not running in Google Cloud environment, using local credentials");
    }
    
    // If not running in Google Cloud, try to use local credentials via exec
    if (typeof window === 'undefined') {
      try {
        // Use dynamic import instead of require
        const { exec } = await import('child_process');
        
        return new Promise<string | null>((resolve, reject) => {
          exec('gcloud auth print-access-token', (error: Error | null, stdout: string, stderr: string) => {
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
          });
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