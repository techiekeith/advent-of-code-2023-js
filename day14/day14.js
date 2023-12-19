const fs = require('fs');

const getMap = (filename) => fs.readFileSync(filename)
  .toString().replaceAll('\r', '').split('\n').map(str => str.split(''));

const moveRocks = (map, dir) => {
  let moved = false;
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      let nx = x + dir.dx;
      let ny = y + dir.dy;
      if (ny >= 0 && ny < map.length && nx >= 0 && nx < map[ny].length) {
        const a = map[ny][nx];
        const b = map[y][x];
        if (a === '.' && b === 'O') {
          moved = true;
          map[ny][nx] = 'O';
          map[y][x] = '.';
        }
      }
    }
  }
  if (moved) {
    moveRocks(map, dir);
  }
}

const spin = (map) => {
  moveRocks(map, { dx: 0, dy: -1 });
  moveRocks(map, { dx: -1, dy: 0 });
  moveRocks(map, { dx: 0, dy: 1 });
  moveRocks(map, { dx: 1, dy: 0 });
}

const compareMaps = (map1, map2) => {
  if (map1.length !== map2.length) {
    return false;
  }
  for (let y = 0; y < map1.length; y++) {
    if (map1[y].length !== map2[y].length) {
      return false;
    }
    for (let x = 0; x < map1[y].length; x++) {
      if (map1[y][x] !== map2[y][x]) {
        return false;
      }
    }
  }
  return true;
}

const getLoad = (map) => {
  let sum = 0;
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === 'O') {
        sum += map.length - y - 1;
      }
    }
  }
  return sum;
}

const detectLoop = (array) => {
  for (let loopSize = 2; loopSize <= array.length / 2; loopSize++) {
    let found = true;
    let elem1 = array.length - loopSize;
    let elem2 = elem1 - loopSize;
    for (let idx = 0; idx < loopSize; idx++) {
      if (array[elem1] !== array[elem2]) {
        found = false;
        break;
      }
      elem1++;
      elem2++;
    }
    if (found) {
      console.log(`Found loop starting at ${array.length - loopSize}, length ${loopSize}`);
      return { start: array.length - loopSize, len: loopSize };
    }
  }
  return {};
}

const getLoadAtCycle = (load, loop, cycle) => {
  const mappedCycle = ((cycle - loop.start) % loop.len) + loop.start;
  console.log(`mapped cycle: ${mappedCycle}`);
  return load[mappedCycle - 1];
}

const testPart1 = () => {
  let part1testMap = getMap("test.txt");
  moveRocks(part1testMap, { dx: 0, dy: -1 });
  let part1expected = getMap("part1-expected.txt");
  console.log(`Test map has expected result when tilted: ${compareMaps(part1testMap, part1expected)}`);
  console.log(`Test map load (should be 136): ${getLoad(part1testMap)}`);
}

const testPart2 = () => {
  let testLoad = [];
  let part2testMap = getMap("test.txt");

  spin(part2testMap);
  let part2expectedCycle1 = getMap("part2-expected-cycle1.txt");
  console.log(`Test map has expected result after 1 cycle: ${compareMaps(part2testMap, part2expectedCycle1)}`);
  testLoad.push(getLoad(part2testMap));
  console.log(`Test map load after 1 cycle: ${testLoad[testLoad.length - 1]}`);

  spin(part2testMap);
  let part2expectedCycle2 = getMap("part2-expected-cycle2.txt");
  console.log(`Test map has expected result after 2 cycles: ${compareMaps(part2testMap, part2expectedCycle2)}`);
  testLoad.push(getLoad(part2testMap));
  console.log(`Test map load after 2 cycles: ${testLoad[testLoad.length - 1]}`);

  spin(part2testMap);
  let part2expectedCycle3 = getMap("part2-expected-cycle3.txt");
  console.log(`Test map has expected result after 3 cycles: ${compareMaps(part2testMap, part2expectedCycle3)}`);
  testLoad.push(getLoad(part2testMap));
  console.log(`Test map load after 3 cycles: ${testLoad[testLoad.length - 1]}`);

  let testLoop = {};
  for (let i = 4; ; i++) {
    spin(part2testMap);
    testLoad.push(getLoad(part2testMap));
    testLoop = detectLoop(testLoad);
    console.log(`Test map load after ${i} cycles: ${testLoad[testLoad.length - 1]}`);
    if (testLoop.start) {
      break;
    }
  }
  console.log(`Test map load after 1000000000 cycles (should be 64): ${getLoadAtCycle(testLoad, testLoop, 1000000000)}`);
}

const solvePart1 = () => {
  let part1map = getMap("input.txt");
  moveRocks(part1map, { dx: 0, dy: -1 });
  console.log(`Part 1 result: ${getLoad(part1map)}`);
}

const solvePart2 = () => {
  let part2map = getMap("input.txt");
  let load = [];
  let loop = {};
  for (let i = 0; ; i++) {
    spin(part2map);
    load.push(getLoad(part2map));
    loop = detectLoop(load);
    if (loop.start) {
      break;
    }
  }
  console.log(`Part 2 result: ${getLoadAtCycle(load, loop, 1000000000)}`);
}

testPart1();
testPart2();
solvePart1();
solvePart2();
