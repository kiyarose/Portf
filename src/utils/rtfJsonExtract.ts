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

function decodeHexByte(body: string, index: number): { text: string; nextIndex: number } | null {
  const hex = body.slice(index + 2, index + 4);
  if (!/^[0-9a-fA-F]{2}$/.test(hex)) {
    return null;
  }
  const code = Number.parseInt(hex, 16);
  return {
    text: CP1252_MAP[code] ?? String.fromCodePoint(code),
    nextIndex: index + 3,
  };
}

function decodeControlWord(
  controlWord: string,
  onUnicodeError: (detail: string, error: unknown) => void,
): string | null {
  const normalized = controlWord.toLowerCase();
  if (normalized in DASH_MAPPINGS) {
    return DASH_MAPPINGS[normalized] ?? null;
  }
  const unicodeMatch = /^u(-?\d+)$/u.exec(normalized);
  if (!unicodeMatch) {
    return null;
  }
  const parsed = Number.parseInt(unicodeMatch[1] ?? "", 10);
  if (!Number.isInteger(parsed)) {
    return null;
  }
  const codePoint = parsed < 0 ? 65536 + parsed : parsed;
  try {
    return String.fromCodePoint(codePoint);
  } catch (unicodeError) {
    onUnicodeError(controlWord, unicodeError);
    return null;
  }
}

function appendRtfBodyChar(
  body: string,
  index: number,
  onUnicodeError: (detail: string, error: unknown) => void,
): { text: string; nextIndex: number } {
  const char = body[index];
  if (char !== "\\") {
    if (char === "{" || char === "}") {
      return { text: "", nextIndex: index };
    }
    return { text: char, nextIndex: index };
  }

  const next = body[index + 1];
  if (next === "-") {
    return { text: "-", nextIndex: index + 1 };
  }
  if (next === "{" || next === "}" || next === "\\") {
    return { text: next, nextIndex: index + 1 };
  }
  if (next === "'") {
    const hexDecoded = decodeHexByte(body, index);
    if (hexDecoded) {
      return hexDecoded;
    }
  }

  let cursor = index + 1;
  while (cursor < body.length && /[a-zA-Z0-9-]/.test(body[cursor] ?? "")) {
    cursor += 1;
  }
  const controlWord = body.slice(index + 1, cursor);
  const decoded = decodeControlWord(controlWord, onUnicodeError);
  if (decoded !== null) {
    if (body[cursor] === " ") {
      cursor += 1;
    } else if (body[cursor] === "'") {
      const hex = body.slice(cursor + 1, cursor + 3);
      if (/^[0-9a-fA-F]{2}$/.test(hex)) {
        cursor += 3;
      }
    } else if (body[cursor] !== undefined) {
      cursor += 1;
    }
    return { text: decoded, nextIndex: cursor - 1 };
  }

  if (body[cursor] === " ") {
    cursor += 1;
  }
  return { text: "", nextIndex: cursor - 1 };
}

/**
 * Strips minimal RTF syntax from TextEdit exports so JSON can be parsed.
 */
export function extractJsonFromRtf(
  raw: string,
  onUnicodeError: (detail: string, error: unknown) => void,
): string | null {
  if (!raw.trim().startsWith("{\\rtf")) {
    return null;
  }

  const marker = "\\f0\\fs24 \\cf0 ";
  const markerIndex = raw.indexOf(marker);
  const body = markerIndex >= 0 ? raw.slice(markerIndex + marker.length) : raw;

  let result = "";
  for (let index = 0; index < body.length; index += 1) {
    const { text, nextIndex } = appendRtfBodyChar(body, index, onUnicodeError);
    result += text;
    index = nextIndex;
  }

  const sanitized = result
    .replace(/\\\r?\n/g, "\n")
    .replace(/\\([{}])/g, "$1")
    .split("\n")
    .map((line) => line.replace(/\\+$/u, "").trimEnd())
    .join("\n")
    .trim();

  return sanitized.length > 0 ? sanitized : null;
}