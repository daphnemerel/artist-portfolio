import { en, type Dictionary } from "./en";
import { nl } from "./nl";
import type { Locale } from "../config";

export type { Dictionary };
export const dictionaries: Record<Locale, Dictionary> = { nl, en };
