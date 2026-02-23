import { randomBytes } from "crypto";

/**
 * Gera um ID hexadecimal de 32 caracteres
 */
export function generateHexId(): string {
  return randomBytes(16).toString("hex");
}
