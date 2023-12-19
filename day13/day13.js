const fs = require('fs');

const getMaps = (filename) => fs.readFileSync(filename).toString()
  .replaceAll('\r', '').split('\n\n')
  .map(str => str.split('\n').filter(str => str !== ''));


// flipmap(string[]): string[] - reuse from day 10
const flipMap = (rows) => {
  let columns = [];
  for (let i = 0; i < rows[0].length; i++) {
    let column = rows.map(row => row[i]).join('');
    columns.push(column);
  }
  return columns;
}

const countReflectedRowsFromRow = (rows, idx, allowedDiffs) => {
  let reflectedIdx = idx - 1;
  let forwardIdx = idx;
  let diffs = 0;

  while (reflectedIdx >= 0 && forwardIdx < rows.length) {
    for (let n = 0; n < rows[reflectedIdx].length; n++) {
      if (rows[reflectedIdx][n] !== rows[forwardIdx][n]) diffs++;
    }
    reflectedIdx--;
    forwardIdx++;
  }
  return diffs === allowedDiffs ? idx : 0;
}

const countTotalReflectedRows = (rows, allowedDiffs) => rows
  .map((_, idx) => countReflectedRowsFromRow(rows, idx, allowedDiffs))
  .reduce((a, b) => a + b, 0);

const solve = (filename, allowedDiffs) => {
  let maps = getMaps(filename);
  const reflectedRows = maps.map(lines => countTotalReflectedRows(lines, allowedDiffs)).reduce((a, b) => a + b, 0);
  const reflectedColumns = maps.map(lines => countTotalReflectedRows(flipMap(lines), allowedDiffs)).reduce((a, b) => a + b, 0);;
  return reflectedColumns + 100 * reflectedRows;
}

const partOneTestResult = solve('test.txt', 0);
console.log(`Part 1 (test data): ${partOneTestResult}`);

const partOneRealResult = solve('input.txt', 0);
console.log(`Part 1 (real data): ${partOneRealResult}`);

const partTwoTestResult = solve('test.txt', 1);
console.log(`Part 2 (test data): ${partTwoTestResult}`);

const partTwoRealResult = solve('input.txt', 1);
console.log(`Part 2 (real data): ${partTwoRealResult}`);
