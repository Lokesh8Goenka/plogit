import type { VisionProvider } from "./VisionProvider.js";
import type { IdentifyResult } from "../types.js";

/**
 * Returns a plausible, fixed identification so the whole pipeline can be built
 * and tested without an API key. Swap for GeminiProvider once the key is ready.
 *
 * The dictIds here must exist in litter-dictionary.json so the lookup resolves.
 */
export class MockProvider implements VisionProvider {
  readonly name = "mock";

  async identify(_imageBase64: string, _mimeType: string): Promise<IdentifyResult> {
    // Simulate a little latency so the UI loading state is real.
    await new Promise((r) => setTimeout(r, 400));
    return {
      items: [
        { dictId: "pet_bottle_500ml", label: "PET water bottle (500ml)", category: "pet_bottle", count: 2, confidence: "high" },
        { dictId: "chips_packet_small", label: "Chips packet (small)", category: "chips_packet", count: 3, confidence: "high" },
        { dictId: "cigarette_butt", label: "Cigarette butt", category: "cigarette_butt", count: 5, confidence: "medium" },
        { dictId: null, label: "Unidentified plastic scrap", category: "misc_plastic", count: 1, confidence: "low" },
      ],
      note: "mock identification — no real model called",
    };
  }
}
