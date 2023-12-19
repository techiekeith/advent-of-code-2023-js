const fs = require('fs');

const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;

const DIRS = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
];

const getMap = (filename) => fs.readFileSync(filename).toString().trim().split('\n')
    .map(str => str.trim().split('')
        .map(c => { return { loss: Number(c), totalLoss: new Array(40).fill(NaN) } }));

const totalHeatLoss = (map, minLine) => map[map.length - 1][map[map.length - 1].length - 1].totalLoss
    .filter((_, index) => index >= minLine * 4)
    .reduce((a, b) => isNaN(a) ? b : (a > b ? b : a), NaN);

const nextPath = (map, path, dir, line, minLine) => {
    let [x, y] = [ path.x + DIRS[dir].dx, path.y + DIRS[dir].dy ];
    if (x < 0 || y < 0 || y >= map.length || x >= map[y].length) {
        return [];
    }
    let loss = path.loss + map[y][x].loss;
    let nextMoveLoss = map[y][x].totalLoss[dir + line * 4];
    if (loss >= nextMoveLoss) {
        // console.log(`(${x}, ${y}) dir:${dir} line:${line} loss: ${loss} >= next ${nextMoveLoss}`);
        return [];
    }
    let targetLoss = totalHeatLoss(map, minLine);
    if (loss > targetLoss) {
        // console.log(`(${x}, ${y}) dir:${dir} line:${line} loss: ${loss} >= target ${targetLoss}`);
        return [];
    }
    map[y][x].totalLoss[dir + line * 4] = loss;
    return [{ x, y, dir, line, loss, history: [ ...path.history, { ...path, history: undefined } ] }];
};

const nextPaths = (map, lastPath, minLine, maxLine) => {
    let newPaths = [];
    let nextLine = lastPath.line + 1;
    if (nextLine < maxLine) {
        newPaths.push(...nextPath(map, lastPath, lastPath.dir, nextLine, minLine));
    }
    if (nextLine >= minLine) {
        newPaths.push(...nextPath(map, lastPath, (lastPath.dir + 1) & 3, 0, minLine));
        newPaths.push(...nextPath(map, lastPath, (lastPath.dir + 3) & 3, 0, minLine));
    }
    return newPaths;
};

const findRoute = (map, minLine = 0, maxLine = 3) => {
    let paths = [
        { x: 0, y: 0, dir: EAST, line: -1, loss: 0, history: [] },
        { x: 0, y: 0, dir: SOUTH, line: -1, loss: 0, history: [] },
    ];
    let found;
    while (paths.length !== 0) {
        let minLoss = paths.reduce((a, b) => a < b.loss ? a : b.loss, NaN);
        const next = paths.filter(path => path.loss > minLoss);
        paths.filter(path => path.loss === minLoss).forEach(path => {
            if (path.y === map.length - 1 && path.x === map[path.y].length - 1 && path.line >= minLine) {
                found = path;
            }
            next.push(...nextPaths(map, path, minLine, maxLine));
        });
        if (found) {
            break;
        }
        paths = next;
    }
    return found;
};

console.log(`Test part 1 result: ${findRoute(getMap("test.txt")).loss}`);
console.log(`Part 1 result: ${findRoute(getMap("input.txt")).loss}`);

console.log(`Test part 2 result: ${findRoute(getMap("test.txt"), 4, 10).loss}`);
// console.log(`Part 2 result: ${findRoute(getMap("input.txt"), 4, 10).loss}`);

// Visualization of Part 2 result
const ESCAPE = String.fromCharCode(27);
const PATH = ESCAPE + "[48;5;9m";
const COLORS = [
    ESCAPE + "[m",
    ESCAPE + "[38;5;28m",
    ESCAPE + "[38;5;31m",
    ESCAPE + "[38;5;64m",
    ESCAPE + "[38;5;67m",
    ESCAPE + "[38;5;100m",
    ESCAPE + "[38;5;103m",
    ESCAPE + "[38;5;136m",
    ESCAPE + "[38;5;139m",
    ESCAPE + "[38;5;175m",
];

const map = getMap("input.txt");
const route = findRoute(map, 4, 10);
for (let y = 0; y < map.length; y++) {
    let str = "";
    for (let x = 0; x < map[y].length; x++) {
        let point = route.history.find(point => point.y === y && point.x === x);
        if (y === map.length - 1 && x === map[y].length - 1) {
            point = route;
        }
        if (point && point.line >= 0) {
            str += PATH;
        }
        str += COLORS[map[y][x].loss] + String(map[y][x].loss) + COLORS[0];
    }
    console.log(str);
}
console.log(`Part 2 result: ${route.loss}`);
