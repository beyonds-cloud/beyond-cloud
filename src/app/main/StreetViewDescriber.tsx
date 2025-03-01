import { useState } from "react";
import { Loader2, Wand2, Camera } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface StreetViewDescriberProps {
  latitude: number | null;
  longitude: number | null;
  heading: number;
  pitch: number;
  onClose: () => void;
}

interface ApiResponse {
  image: string;
  description: {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
    error?: string;
  };
  errorDetails?: string;
  rawResponse?: unknown;
}

interface GeneratedImageResponse {
  image: string;
  enhancedPrompt?: string;
  error?: string;
  errorDetails?: string;
}

interface ErrorResponse {
  error: string;
}

// Predefined prompt style options
const PROMPT_TWISTS = [
  { value: "none", label: "None" },
  {
    value:
      "now, the twist: the scene is in the style of the future, incorporate futuristic elements into each part of the scene",
    label: "Futuristic",
  },
  {
    value:
      "now, the twist: the scene is in the style of the past, incorporate historical elements into each part of the scene",
    label: "Historical",
  },
  {
    value:
      "now, the twist: the scene is in the style of post-apocalyptic world, incorporate post-apocalyptic elements into each part of the scene",
    label: "Post-Apocalyptic",
  },
  {
    value:
      "now, the twist: the scene is in the style of fantasy world, incorporate fantasy elements into each part of the scene",
    label: "Fantasy",
  },
  {
    value:
      "now, the twist: the scene is in the style of cyberpunk, incorporate cyberpunk elements into each part of the scene",
    label: "Cyberpunk",
  },
  {
    value:
      "now, the twist: the scene is in the style of steampunk, incorporate steampunk elements into each part of the scene",
    label: "Steampunk",
  },
];

export default function StreetViewDescriber({
  latitude,
  longitude,
  heading,
  pitch,
  onClose,
}: StreetViewDescriberProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // States for generated image
  const [generatedImageLoading, setGeneratedImageLoading] = useState(false);
  const [generatedImageError, setGeneratedImageError] = useState<string | null>(
    null,
  );
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  );

  // Combined loading state
  const [combinedLoading, setCombinedLoading] = useState(false);

  // New states for prompt customization
  const [selectedPromptStyle, setSelectedPromptStyle] = useState("");
  const [customPromptAddition, setCustomPromptAddition] = useState("");

  const getDescription = async () => {
    if (!latitude || !longitude) {
      setError("Missing location coordinates");
      return;
    }

    setLoading(true);
    setError(null);
    setDebugInfo(null);
    setGeneratedImageUrl(null);
    setGeneratedImageError(null);
    setEnhancedPrompt(null);

    // Build prompt additions
    let promptAdditions = "";
    if (selectedPromptStyle && selectedPromptStyle !== "none") {
      promptAdditions += selectedPromptStyle;
    }
    if (customPromptAddition) {
      if (promptAdditions) promptAdditions += ". ";
      promptAdditions += customPromptAddition;
    }

    try {
      const response = await fetch("/api/streetview-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude,
          longitude,
          heading,
          pitch,
          promptAdditions, // Send the prompt additions to the API
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.error || "Failed to get description");
      }

      const data = (await response.json()) as ApiResponse;
      console.log("API Response:", data);

      setImageUrl(data.image);

      // Process the AI response
      if (data.description?.error) {
        setError(`Error from AI service: ${data.description.error}`);
        if (data.errorDetails) {
          setDebugInfo(data.errorDetails);
        } else if (data.rawResponse) {
          setDebugInfo(JSON.stringify(data.rawResponse, null, 2));
        }
        setDescription("No description available");
        return null;
      } else {
        const descriptionText =
          data.description?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (descriptionText) {
          setDescription(descriptionText);
          return descriptionText;
        } else {
          setDescription("No description available");
          setDebugInfo(
            "Response format didn't contain expected text. Raw response: " +
              JSON.stringify(data.description, null, 2),
          );
          return null;
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async (descriptionText: string) => {
    if (!descriptionText || descriptionText === "No description available") {
      setGeneratedImageError(
        "No valid description available to generate an image",
      );
      return false;
    }

    setGeneratedImageLoading(true);
    setGeneratedImageError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: descriptionText,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = (await response.json()) as GeneratedImageResponse;
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedImageUrl(data.image);
      if (data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt);
      }
      return true;
    } catch (err) {
      setGeneratedImageError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      return false;
    } finally {
      setGeneratedImageLoading(false);
    }
  };

  // Combined function to get description and then generate image
  const getDescriptionAndGenerateImage = async () => {
    setCombinedLoading(true);

    try {
      const descriptionText = await getDescription();
      if (descriptionText) {
        await generateImage(descriptionText);
      }
    } finally {
      setCombinedLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative max-h-[90vh] w-[95vw] max-w-6xl overflow-auto rounded-lg bg-gray-800 p-6 shadow-xl">
        <Button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
        >
          ✕
        </Button>

        <h2 className="mb-4 text-center text-2xl font-bold text-white">
          Street View AI Experience
        </h2>

        {!imageUrl && !description && !loading && !combinedLoading && (
          <div className="mb-6 text-center">
            <p className="mb-4 text-gray-300">
              Generate an AI description of this Street View location and create
              an image from it.
            </p>

            {/* Prompt customization options */}
            <div className="mx-auto mb-4 max-w-md space-y-3">
              <div>
                <label
                  htmlFor="promptStyle"
                  className="mb-1 block text-left text-sm font-medium text-gray-300"
                >
                  Twist (optional)
                </label>
                <Select
                  value={selectedPromptStyle}
                  onValueChange={(value) => setSelectedPromptStyle(value)}
                >
                  <SelectTrigger className="w-full rounded-md border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white">
                    <SelectValue placeholder="Select a twist" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMPT_TWISTS.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="customPrompt"
                  className="mb-1 block text-left text-sm font-medium text-gray-300"
                >
                  Custom Twist (optional)
                </label>
                <Input
                  id="customPrompt"
                  type="text"
                  value={customPromptAddition}
                  onChange={(e) => setCustomPromptAddition(e.target.value)}
                  placeholder="Now, the twist:..."
                  className="w-full rounded-md border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-3 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
              <Button
                onClick={getDescription}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                disabled={loading || combinedLoading}
              >
                <Camera className="h-5 w-5" />
                Get Description Only
              </Button>

              <Button
                onClick={getDescriptionAndGenerateImage}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-semibold text-white hover:from-blue-700 hover:to-purple-700"
                disabled={loading || combinedLoading}
              >
                <Wand2 className="h-5 w-5" />
                Describe & Generate Image
              </Button>
            </div>
          </div>
        )}

        {(loading || combinedLoading) && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="mt-4 text-gray-300">
              {loading
                ? "Generating AI description..."
                : "Processing your request..."}
            </p>
            {generatedImageLoading && (
              <p className="mt-2 text-purple-300">
                Creating image from description...
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-red-300">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {debugInfo && (
          <div className="mb-4 rounded-lg bg-gray-700 p-3 text-gray-300">
            <details>
              <summary className="cursor-pointer font-bold">
                Debug Info (Click to expand)
              </summary>
              <pre className="mt-2 overflow-auto text-xs">{debugInfo}</pre>
            </details>
          </div>
        )}

        {imageUrl && description && !combinedLoading && (
          <>
            {!generatedImageUrl && !generatedImageLoading && (
              <div className="mb-4 flex justify-center">
                <Button
                  onClick={() => generateImage(description)}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700"
                  disabled={generatedImageLoading}
                >
                  <Wand2 className="h-5 w-5" />
                  Generate Image from Description
                </Button>
              </div>
            )}

            {generatedImageLoading && (
              <div className="mb-4 flex justify-center">
                <div className="flex items-center gap-2 rounded-lg bg-purple-800 px-4 py-2 text-white">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating image...
                </div>
              </div>
            )}

            {generatedImageError && (
              <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-red-300">
                <p className="font-bold">Image Generation Error:</p>
                <p>{generatedImageError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="flex flex-col">
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Street View
                </h3>
                <div className="relative w-full overflow-hidden rounded-lg border-2 border-blue-500 pt-[56.25%]">
                  <Image
                    src={imageUrl}
                    alt="Street View"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>

              {generatedImageUrl && (
                <div className="flex flex-col">
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    AI Generated Image
                  </h3>
                  <div className="relative w-full overflow-hidden rounded-lg border-2 border-purple-500 pt-[56.25%]">
                    <Image
                      src={generatedImageUrl}
                      alt="AI Generated Scene"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
