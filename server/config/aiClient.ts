import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env.js";

const anthropicClient = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;

const isAiConfigured = (): boolean => Boolean(anthropicClient);

export { anthropicClient, isAiConfigured };
