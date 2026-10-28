export type CodeToken = [content: string, color: string, fontStyle: number];
export type CodeTokens = CodeToken[][];
export type CodeHighlights = Record<string, CodeTokens>;

export function codeKey(language: string, code: string) {
  return JSON.stringify([
    language.toLowerCase(),
    code.replace(/\r\n/g, "\n").replace(/\n$/, ""),
  ]);
}
