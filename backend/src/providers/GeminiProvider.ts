import type { VisionProvider } from "./VisionProvider.js";
import type { IdentifyResult, IdentifiedItem } from "../types.js";
import { buildIdentifyPrompt } from "../prompt.js";

/**
 * Real hosted provider. Drop-in replacement for MockProvider.
 *
 * To enable: set GEMINI_API_KEY in the environment. No other file changes.
 * Uses the Gemini generateContent REST endpoint directly (no SDK dependency),
 * asking for a strict JSON response we can parse into IdentifiedItem[].
 */
export class GeminiProvider implements VisionProvider {
  readonly name = "gemini";
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model = "gemini-3.5-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async identify(imageBase64: string, mimeType: string): Promise<IdentifyResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body = {
      contents: [
        {
          parts: [
            { text: buildIdentifyPrompt() },
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    };

    // Retry on transient 429/503 with exponential backoff. Free-tier flash
    // models throw UNAVAILABLE under load; a couple of retries clears it.
    let res: Response | undefined;
    const delays = [0, 1500, 4000];
    for (let i = 0; i < delays.length; i++) {
      if (delays[i]) await new Promise((r) => setTimeout(r, delays[i]));
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) break;
      if (res.status !== 429 && res.status !== 503) break; // non-transient: stop
    }

    if (!res || !res.ok) {
      throw new Error(`Gemini error ${res?.status}: ${res ? await res.text() : "no response"}`);
    }

    const data = (await res.json()) as any;
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    let parsed: { items?: IdentifiedItem[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`Gemini returned non-JSON: ${text.slice(0, 500)}`);
    }

    return { items: parsed.items ?? [], note: `gemini:${this.model}` };
  }
}
