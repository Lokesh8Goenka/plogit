import { listDictionaryForPrompt } from "./dictionary.js";

/**
 * The identify prompt. Shared by every real provider so that swapping the
 * model never changes what we ask for.
 *
 * Strategy: the model IDENTIFIES, it never guesses weight. We hand it the
 * dictionary catalog and ask it to match each visible item to a dictId when it
 * can, falling back to a category when it can't.
 */
export function buildIdentifyPrompt(): string {
  return `You are a litter identification assistant for a plogging (litter-picking) app.

Look at the photo of collected waste. Identify each distinct type of item and COUNT how many of each you see.

Match each item to one of the known catalog entries below by its id when you reasonably can. If you recognise the category but not the specific product, set dictId to null and still give the category. If you cannot tell at all, use category "misc_plastic" or the closest category and dictId null.

Do NOT estimate weight. Only identify and count.

Known catalog (id | label | category):
${listDictionaryForPrompt()}

Return STRICT JSON only, matching exactly this shape:
{
  "items": [
    { "dictId": "pet_bottle_500ml" | null, "label": "short human label", "category": "one_category_id", "count": <integer>, "confidence": "high" | "medium" | "low" }
  ]
}

Rules:
- confidence reflects how sure you are of the identification, not the count.
- Combine identical items into one entry with a count; do not list duplicates.
- Only include items that are actually visible as collected waste.`;
}
