import jwt from "jsonwebtoken";

export default function extractAccountIdFromToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.decode(token) as { internalId?: string };
    return decoded?.internalId || null;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}
