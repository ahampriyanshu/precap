// Complete each stage; see README.md for the exact contract.
export function prototype(words, prefix, limit) {
  throw new Error("Not implemented");
}

export function solve(words, prefix, limit) {
  throw new Error("Not implemented");
}

export function compareText(left, right) {
  const a = Array.from(left), b = Array.from(right);
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const difference = a[i].codePointAt(0) - b[i].codePointAt(0);
    if (difference) return difference;
  }
  return a.length - b.length;
}
