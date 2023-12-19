const fs = require('fs');

const mayContain = (str, substr, offset) => {
  if (str.length < offset + substr.length) {
    return false;
  }
  for (let i = 0; i < substr.length; i++) {
    if (str[offset + i] !== substr[i] && str[offset + i] !== '?') {
      return false;
    }
  }
  return true;
}

let recursePattern = "";
let recurseArray = [];
let cachedResults = [];

const recurse = (idx, max, offset) => {
  if (cachedResults[idx] && cachedResults[idx][max] && cachedResults[idx][max][offset]) {
    return cachedResults[idx][max][offset];
  }
  const toMatch = recurseArray[idx];
  const hasMore = idx < recurseArray.length - 1;
  let sum = 0;
  for (let i = 0; i <= max; i++) {
    const substr = ".".repeat(i) + "#".repeat(toMatch) + (hasMore ? "." : "");
    if (mayContain(recursePattern, substr, offset)) {
      if (hasMore) {
        sum += recurse(idx + 1, max - i, offset + substr.length);
      } else if (mayContain(recursePattern, ".".repeat(max - i), offset + substr.length)) {
        sum++;
      }
    }
  }
  cachedResults[idx] ||= [];
  cachedResults[idx][max] ||= [];
  cachedResults[idx][max][offset] = sum;
  return sum;
}

const getMatchingPermutations = (chars, numbers) => {
  let broken = numbers.split(',').map(n => Number(n));
  let row = chars.replace(/^[.]+|[.]+$/g, '').replace(/[.]+/, '.');
  let minLength = broken.reduce((a,b) => a + b, 0) + broken.length - 1;
  let diff = row.length - minLength;
  recursePattern = row;
  recurseArray = broken;
  cachedResults = [];
  return recurse( 0, diff, 0);
}

const getMatchingPermutationsPartOne = (line) => {
  let [chars, numbers] = line.split(' ');
  if (numbers === undefined) {
    return 0;
  }
  return getMatchingPermutations(chars, numbers);
}

const getMatchingPermutationsPartTwo = (line, idx) => {
  let [chars, numbers] = line.split(' ');
  if (numbers === undefined) {
    return 0;
  }
  const result = getMatchingPermutations(
    [chars, chars, chars, chars, chars].join('?'),
    [numbers, numbers, numbers, numbers, numbers].join(','),
  );
  console.log(`Index: ${idx} Result: ${result}`);
  return result;
}

const lines = (filename) => fs.readFileSync(filename).toString().split('\n');
const sumPartOne = (lines) => lines.map(getMatchingPermutationsPartOne).reduce((a, b) => a + b, 0);
const sumPartTwo = (lines) => lines.map(getMatchingPermutationsPartTwo).reduce((a, b) => a + b, 0);

console.log(`Part 1 (test data): ${sumPartOne(lines("test.txt"))}`);
console.log(`Part 1 (puzzle input): ${sumPartOne(lines("input.txt"))}`);

console.log(`Part 2 (test data): ${sumPartTwo(lines("test.txt"))}`);
console.log(`Part 2 (puzzle input): ${sumPartTwo(lines("input.txt"))}`);
