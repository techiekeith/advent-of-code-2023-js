const fs = require('fs');

const getMap = (filename) => fs.readFileSync(filename).toString().split('\n');

const findStart = (map) => {
  for (let y = 0; y < map.length; y++) {
    const x = map[y].indexOf('S');
    if (x >= 0) {
      return { x, y };
    }
  }
}

const NORTH = { x: 0, y: -1 };
const EAST = { x: 1, y: 0 };
const SOUTH = { x: 0, y: 1 };
const WEST = { x: -1, y: 0 };

const move = (from, dir) => {
  return { x: from.x + dir.x, y: from.y + dir.y };
}

const canMove = (to, dir) => {
  if (dir === NORTH) {
    return "|F7".indexOf(to) >= 0;
  }
  if (dir === EAST) {
    return "-J7".indexOf(to) >= 0;
  }
  if (dir === SOUTH) {
    return "|LJ".indexOf(to) >= 0;
  }
  if (dir === WEST) {
    return "-LF".indexOf(to) >= 0;
  }
}

const nextDir = (at, from_dir) => {
  if (from_dir !== SOUTH && canMove(at, SOUTH)) {
    return NORTH;
  }
  if (from_dir !== WEST && canMove(at, WEST)) {
    return EAST;
  }
  if (from_dir !== NORTH && canMove(at, NORTH)) {
    return SOUTH;
  }
  if (from_dir !== EAST && canMove(at, EAST)) {
    return WEST;
  }
}

const countSteps = (map, start, start_dir) => {
  let pos = start;
  let dir = start_dir;
  let steps = 0;
  let visited = [];
  while (true) {
    let next = move(pos, dir);
    steps++;
    let nextSection = map[next.y][next.x];
    if (nextSection === 'S') {
      visited.push(pos);
      return visited;
    }
    if (!canMove(nextSection, dir)) {
      return [];
    }
    visited.push(pos);
    pos = next;
    dir = nextDir(nextSection, dir);
  }
}

const solveForPartOne = (map) => {
  const start = findStart(map);
  return [NORTH, EAST, SOUTH, WEST].map(dir => {
    return countSteps(map, start, dir);
  }).reduce((a, b) => {
    if (!b || a.length > b.length) { return a; }
    return b;
  });
}

const calcStartPipe = (map, visited) => {
  const start = visited[0];
  const first = visited[1];
  const last = visited[visited.length - 1];
  const start_dir = { x: first.x - start.x, y: first.y - start.y };
  const end_dir = { x: last.x - start.x, y: last.y - start.y };
  const north = start_dir.y === NORTH.y || end_dir.y === NORTH.y;
  const east = start_dir.x === EAST.x || end_dir.x === EAST.x;
  const south = start_dir.y === SOUTH.y || end_dir.y === SOUTH.y;
  const west = start_dir.x === WEST.x || end_dir.x === WEST.x;
  if (north && south) {
    return '|';
  }
  if (east && west) {
    return '-';
  }
  if (north && east) {
    return 'L';
  }
  if (north && west) {
    return 'J';
  }
  if (south && east) {
    return 'F';
  }
  if (south && west) {
    return '7';
  }
}

const replaceChars = (str, idx, chr) => {
  return str.substring(0, idx) + chr + str.substring(idx + chr.length);
}

const getLargeMap = (map, visited) => {
  const loop = [];
  loop.push('o'.repeat(map[0].length * 2 + 1));
  for (let i = 0; i < map.length * 2 - 1; i++) {
    loop.push('o' + '.'.repeat(map[0].length * 2 - 1) + 'o');
  }
  loop.push('o'.repeat(map[0].length * 2 + 1));
  const startPipeSection = calcStartPipe(map, visited);
  visited.forEach(pos => {
    let section = map[pos.y][pos.x];
    if (section === 'S') {
      section = startPipeSection;
    }
    loop[pos.y * 2 + 1] = replaceChars(loop[pos.y * 2 + 1], pos.x * 2 + 1, section);
    if ("|LJ".indexOf(section) >= 0) {
      loop[pos.y * 2] = replaceChars(loop[pos.y * 2], pos.x * 2 + 1, '|');
    }
    if ("|F7".indexOf(section) >= 0) {
      loop[pos.y * 2 + 2] = replaceChars(loop[pos.y * 2 + 2], pos.x * 2 + 1, '|');
    }
    if ("-J7".indexOf(section) >= 0) {
      loop[pos.y * 2 + 1] = replaceChars(loop[pos.y * 2 + 1], pos.x * 2, '-');
    }
    if ("-LF".indexOf(section) >= 0) {
      loop[pos.y * 2 + 1] = replaceChars(loop[pos.y * 2 + 1], pos.x * 2 + 2, '-');
    }
  });
  return loop;
}

const fillRows = (rows) => {
  let changed = false;
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    while (row.includes('.o')) {
      let match = row.match(/[.]+o/);
      row = replaceChars(row, match.index, 'o'.repeat(match[0].length));
      changed = true;
    }
    while (row.includes('o.')) {
      let match = row.match(/o[.]+/);
      row = replaceChars(row, match.index, 'o'.repeat(match[0].length));
      changed = true;
    }
    rows[i] = row;
  }
  return { rows, changed };
}

const flipMap = (rows) => {
  let columns = [];
  for (let i = 0; i < rows[0].length; i++) {
    let column = rows.map(row => row[i]).join('');
    columns.push(column);
  }
  return columns;
}

const countDots = (rows) => {
  let dots = 0;
  for (let y = 1; y < rows.length; y += 2) {
    for (let x = 1; x < rows[y].length; x += 2) {
      if (rows[y][x] === '.') {
        dots++;
      }
    }
  }
  return dots;
}

const map = getMap("input.txt");
const visited = solveForPartOne(map);
console.log(`Day 10 part 1: ${visited.length / 2}`);

let largeMap = getLargeMap(map, visited);
let result = fillRows(largeMap);
let changed = true;
while (changed) {
  result = fillRows(flipMap(result.rows));
  changed = result.changed;
  result = fillRows(flipMap(result.rows));
  changed ||= result.changed;
}
console.log(`Day 10 part 2: ${countDots(result.rows)}`);
