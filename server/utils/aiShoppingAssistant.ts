import { z } from "zod";
import { anthropicClient } from "../config/aiClient.js";

/**
 * Unites de quantite utilisees partout dans les courses (ajout manuel ET assistant IA).
 * Doit rester identique a SHOPPING_UNITS dans server/client/src/constants/index.ts :
 * c'est ce qui garantit que l'IA ne propose jamais une unite que le selecteur manuel
 * (QuantityInput) ne sait pas afficher.
 */
export const SHOPPING_UNITS = ["", "g", "Kg", "mL", "L"] as const;

const aiShoppingItemSchema = z.object({
  title: z.string().min(1),
  count: z.number().positive(),
  unit: z.enum(SHOPPING_UNITS),
});

const aiShoppingListSchema = z.object({
  items: z.array(aiShoppingItemSchema),
});

export type AiShoppingItem = z.infer<typeof aiShoppingItemSchema>;

const AI_MODEL = "claude-haiku-4-5";

const SHOPPING_LIST_JSON_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Nom de l'article ou de l'ingredient, au singulier, premiere lettre en majuscule",
          },
          count: {
            type: "number",
            description: "Quantite numerique realiste (ex: 500 pour 500 g, 4 pour 4 oeufs)",
          },
          unit: {
            type: "string",
            enum: [...SHOPPING_UNITS],
            description:
              'Unite de quantite, strictement parmi "g" (grammes), "Kg" (kilogrammes), "mL" (millilitres), "L" (litres), ou une chaine vide pour un comptage a la piece (oeufs, fruits/legumes vendus a l\'unite, pain...). Respecter exactement cette casse.',
          },
        },
        required: ["title", "count", "unit"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
};

const SYSTEM_PROMPT = [
  "Tu es un assistant qui transforme une description libre (repas prevu, besoins du foyer, nombre de convives...) en une liste de courses concrete.",
  "Deduis les articles ou ingredients necessaires avec des quantites realistes mais généreuses car on mange beaucoup, en tenant compte du nombre de personnes si précisé, sinon prendre des quantites standard.",
  "Reflechis bien a la recette complete et n'oublie aucun ingredient necessaire (sauce, condiments, accompagnements habituels...), pas seulement l'ingredient principal cite.",
  'Pour l\'unite, choisis uniquement parmi "g", "Kg", "mL", "L", ou une chaine vide pour un comptage a la piece (respecte exactement cette casse, aucune autre unite n\'est acceptee).',
  "Ne renvoie que des articles a acheter : pas d'ustensiles, pas d'etapes de preparation, pas de basiques presumes deja en stock (sel, poivre, eau) sauf si explicitement demandes.",
  "Reponds uniquement en francais.",
].join(" ");

export const generateShoppingListFromDescription = async (description: string): Promise<AiShoppingItem[]> => {
  if (!anthropicClient) {
    throw new Error("AI_NOT_CONFIGURED");
  }

  const response = await anthropicClient.messages.create({
    model: AI_MODEL,
    max_tokens: 2048,
    // Haiku 4.5 n'accepte pas le parametre "effort" (reserve a Fable 5 / Opus 4.6+ / Sonnet 4.6+/5) : le
    // passer renverrait une 400. Seul le format JSON structure est utilise ici.
    output_config: {
      format: { type: "json_schema", schema: SHOPPING_LIST_JSON_SCHEMA },
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: description }],
  });

  const textBlock = response.content.find((block) => block.type === "text");

  if (!textBlock || textBlock.type !== "text") {
    throw new Error("AI_EMPTY_RESPONSE");
  }

  const parsedJson = JSON.parse(textBlock.text);
  const validated = aiShoppingListSchema.parse(parsedJson);

  if (validated.items.length === 0) {
    throw new Error("AI_NO_ITEMS");
  }

  return validated.items;
};
