/**
 * Checks if a message contains phone numbers, emails, or social media handles.
 * Returns true if the message contains prohibited contact info.
 */
export function containsContactInfo(text: string): boolean {
  const patterns = [
    // Phone numbers (7+ digits, with optional separators)
    /(\+?\d[\d\s\-().]{6,}\d)/,
    // Email addresses
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    // Social media handles and keywords
    /(?:instagram|insta|ig|snapchat|snap|whatsapp|telegram|tiktok|twitter|facebook|fb|discord)\s*[:\-@]?\s*\S+/i,
    // @ handles
    /@[a-zA-Z0-9._]{3,}/,
    // "DM me on", "hit me up on", "text me", "call me"
    /(?:dm|text|call|hit\s*me\s*up|add\s*me|follow\s*me|find\s*me)\s*(?:on|at|@)/i,
    // URLs
    /https?:\/\/\S+/i,
    /www\.\S+/i,
  ];

  return patterns.some((pattern) => pattern.test(text));
}

export const CONTACT_INFO_WARNING = "For your safety, sharing phone numbers, emails, social media handles, or external links is not allowed on NEXTLOOK.";
