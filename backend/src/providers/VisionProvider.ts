import type { IdentifyResult } from "../types.js";

/**
 * The ONE seam that protects future hosting cost.
 *
 * Everything in the app talks to this interface, never to a concrete model.
 * Day 1  -> MockProvider / GeminiProvider (hosted, pennies per image).
 * Later  -> SelfHostedProvider (Qwen2.5-VL on our own GPU).
 *
 * Swapping models = swapping the class behind this interface. Same prompt,
 * same dictionary, same pipeline. Nothing downstream changes.
 */
export interface VisionProvider {
  readonly name: string;
  /**
   * @param imageBase64 the photo as a base64 string (no data: prefix)
   * @param mimeType    e.g. "image/jpeg"
   */
  identify(imageBase64: string, mimeType: string): Promise<IdentifyResult>;
}
