import { useEffect, useState } from "react";
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  httpOptions: {
    retryOptions: {
      attempts: 1
    }
  }
});

export function AiSection() {
  const [aiResponse, setAiResponse] = useState<string>();
  const [requestSent, setRequestSent] = useState<boolean>(false);

  (async function () {
    console.log("the response is -- %o", aiResponse);
    console.log("requestSent -- %o", requestSent);
    if (aiResponse !== undefined || requestSent) return;
    setRequestSent(true);
    let interaction;
    try {
      console.log("about to execute ai.interactions.create");
      interaction = await ai.interactions.create({
        model: "gemini-4-hydrogen",
        input: "Can you make up a brief story about a frog and a toad?",
      });
    } catch (error) {
      console.error("There was an error -- %o", error);
    }
    if (interaction?.output_text) {
      setAiResponse(interaction.output_text);
    }
  })();

  useEffect(() => {
    if (aiResponse === undefined) return;
    console.log("The ai response is -- %o", aiResponse);
  }, [aiResponse]);

  return null;
}
