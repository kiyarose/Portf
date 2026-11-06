import { safeConsoleWarn } from "./errorSanitizer";

const RTF_MARKER = "\\f0\\fs24 \\cf0 ";

const DASH_MAPPINGS: Record<string, string> = {
  endash: "–",
  emdash: "—",
  hyphen: "-",
  minus: "-",
};

const CP1252_MAP: Record<number, string> = {
  0x80: "€",
  0x82: "‚",
  0x83: "ƒ",
  0x84: "„",
  0x85: "…",
  0x86: "†",
  0x87: "‡",
  0x88: "ˆ",
  0x89: "‰",
  0x8a: "Š",
  0x8b: "‹",
  0x8c: "Œ",
  0x8e: "Ž",
  0x91: "‘",
  0x92: "’",
  0x93: "“",
  0x94: "”",
  0x95: "•",
  0x96: "–",
  0x97: "—",
  0x98: "˜",
  0x99: "™",
  0x9a: "š",
  0x9b: "›",
  0x9c: "œ",
  0x9e: "ž",
  0x9f: "Ÿ",
};

const MAX_UNICODE_CODE_POINT = 1114111;

function logRtfDebug(context: string, error: unknown) {
  if (import.meta.env.DEV) {
    safeConsoleWarn(`[rtf-json] ${context}`, error);
  }
}

function decodeHexEscape(body: string, startIndex: number): string | null {
  const hex = body.slice(startIndex + 2, startIndex + 4);
  if (!/^[0-9a-fA-F]{2}$/.test(hex)) {
    return null;
  }
  const code = Number.parseInt(hex, 16);
  return CP1252_MAP[code] ?? String.fromCharCode(code);
}

function decodeUnicodeControlWord(controlWord: string): string | null {
  const unicodeMatch = /^u(-?\d+)$/u.exec(controlWord.toLowerCase());
  if (!unicodeMatch) {
    return null;
  }

  const parsed = Number.parseInt(unicodeMatch[1] ?? "", 10);
  if (!Number.isInteger(parsed)) {
    return null;
  }

  const codePoint = parsed < 0 ? 65536 + parsed : parsed;
  if (codePoint < 0 || codePoint > MAX_UNICODE_CODE_POINT) {
    logRtfDebug(`Invalid Unicode code point ${codePoint}`, controlWord);
    return null;
  }

  try {
    return String.fromCodePoint(codePoint);
  } catch (error) {
    logRtfDebug(`Failed to decode \\u sequence ${controlWord}`, error);
    return null;
  }
}

function skipControlWordFallback(body: string, cursor: number): number {
  const fallbackChar = body[cursor];
  if (fallbackChar === "'") {
    const hex = body.slice(cursor + 1, cursor + 3);
    if (/^[0-9a-fA-F]{2}$/.test(hex)) {
      return cursor + 3;
    }
    return cursor;
  }
  return fallbackChar === undefined ? cursor : cursor + 1;
}

function decodeControlWord(
  body: string,
  startIndex: number,
): { text: string; nextIndex: number } | null {
  let cursor = startIndex + 1;
  while (cursor < body.length && /[a-zA-Z0-9-]/.test(body[cursor] ?? "")) {
    cursor += 1;
  }

  const controlWord = body.slice(startIndex + 1, cursor);
  const normalizedControl = controlWord.toLowerCase();

  let decoded: string | null = null;
  if (normalizedControl in DASH_MAPPINGS) {
    decoded = DASH_MAPPINGS[normalizedControl];
  } else {
    decoded = decodeUnicodeControlWord(controlWord);
  }

  if (body[cursor] === " ") {
    cursor += 1;
  }

  if (decoded !== null) {
    cursor = skipControlWordFallback(body, cursor);
    return { text: decoded, nextIndex: cursor };
  }

  return { text: "", nextIndex: cursor };
}

function decodeBackslashSequence(
  body: string,
  startIndex: number,
): { text: string; nextIndex: number } | null {
  const next = body[startIndex + 1];

  if (next === "-") {
    return { text: "-", nextIndex: startIndex + 2 };
  }

  if (next === "{" || next === "}" || next === "\\") {
    return { text: next, nextIndex: startIndex + 2 };
  }

  if (next === "'") {
    const decoded = decodeHexEscape(body, startIndex);
    if (decoded !== null) {
      return { text: decoded, nextIndex: startIndex + 4 };
    }
    return null;
  }

  if (/^[a-zA-Z]$/.test(next ?? "")) {
    const control = decodeControlWord(body, startIndex);
    if (control) {
      return { text: control.text, nextIndex: control.nextIndex };
    }
  }

  return null;
}

function stripRtfPayload(raw: string): string {
  const markerIndex = raw.indexOf(RTF_MARKER);
  return markerIndex >= 0 ? raw.slice(markerIndex + RTF_MARKER.length) : raw;
}

function decodeRtfBody(body: string): string {
  let result = "";

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];

    if (char === "\\") {
      const decoded = decodeBackslashSequence(body, index);
      if (decoded) {
        result += decoded.text;
        index = decoded.nextIndex - 1;
        continue;
      }
    }

    if (char === "{" || char === "}") {
      continue;
    }

    result += char;
  }

  return result;
}

function sanitizeDecodedJson(text: string): string {
  return text
    .replace(/\\\r?\n/g, "\n")
    .replace(/\\([{}])/g, "$1")
    .split("\n")
    .map((line) => line.replace(/\\+$/u, "").trimEnd())
    .join("\n")
    .trim();
}

/** Strip minimal RTF wrappers from TextEdit-exported “JSON” files. */
export function extractJsonFromRtf(raw: string): string | null {
  if (!raw.trim().startsWith("{\\rtf")) {
    return null;
  }

  const decoded = decodeRtfBody(stripRtfPayload(raw));
  const sanitized = sanitizeDecodedJson(decoded);
  return sanitized.length > 0 ? sanitized : null;
}
