const fs = require('fs');

const dirs = {
    'R': { dx: 1, dy: 0 },
    'D': { dx: 0, dy: 1 },
    'L': { dx: -1, dy: 0 },
    'U': { dx: 0, dy: -1 },
};

const dirKeys = ['R', 'D', 'L', 'U'];

const colors = [
    0x000000,
    0xff0000,
    0x00ff00,
    0xffff00,
    0x0000ff,
    0xff00ff,
    0x00ffff,
    0xffffff,
];
const RED = 1;
const GREEN = 2;
const MAGENTA = 5;
const fillColor = colors[MAGENTA];

const ansiColor = (rgb) => `\x1b[38;2;${rgb >> 16};${(rgb >> 8) & 0xff};${rgb & 0xff}m`;

const parseRow = (row) => {
    let [dir, count, hex] = row.trim().split(' ');
    hex = parseInt(hex.substring(2, 8), 16);
    return { dir: dirKeys[hex & 3], count: hex >> 4 };
};

const getPlan = (filename) => fs.readFileSync(filename).toString().trim().split('\n')
    .map(parseRow);

const getMapBounds = (plan) => {
    let [x, y] = [0, 0];
    let xMap = { 0: 1 };
    let yMap = { 0: 1 };
    plan.forEach((row) => {
        [x, y] = [x + dirs[row.dir].dx * row.count, y + dirs[row.dir].dy * row.count];
        row.x = x;
        row.y = y;
        xMap[x] ||= 1;
        yMap[y] ||= 1;
    });
    let xValues = Object.keys(xMap).map(x => Number(x));
    xValues.sort((a, b) => a - b);
    // console.log(xValues);
    let yValues = Object.keys(yMap).map(y => Number(y));
    yValues.sort((a, b) => a - b);
    // console.log(yValues);
    plan.forEach((row) => {
        row.xIndex = xValues.indexOf(row.x);
        row.yIndex = yValues.indexOf(row.y);
        // console.log(`${row.dir} ${row.count} -> ${row.xIndex} ${row.yIndex}`);
    });
    return { xValues, yValues };
};

const createMap = (sizeX, sizeY) => Array.from(Array(sizeY), () => new Array(sizeX).fill(0));

const drawMap = (plan, map, startX, startY) => {
    let [xIndex, yIndex] = [startX * 2, startY * 2];
    plan.forEach((row) => {
        if (row.xIndex === 18 && row.yIndex === 184) {
            console.log(row);
        }
        while (row.xIndex * 2 !== xIndex || row.yIndex * 2 !== yIndex) {
            [xIndex, yIndex] = [xIndex + dirs[row.dir].dx, yIndex + dirs[row.dir].dy];
            map[yIndex][xIndex] = colors[GREEN];
        }
        // console.log(`xIndex=${xIndex} yIndex=${yIndex}`);
    });
};

const fillMap = (map) => {
    let changed, fill;
    do {
        changed = false;
        for (let y = 0; y < map.length; y++) {
            fill = true;
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] === 0 && fill) {
                    map[y][x] = fillColor;
                    changed = true;
                }
                fill = map[y][x] === fillColor;
            }
            fill = true;
            for (let x = map[y].length - 1; x >= 0; x--) {
                if (map[y][x] === 0 && fill) {
                    map[y][x] = fillColor;
                    changed = true;
                }
                fill = map[y][x] === fillColor;
            }
        }
        for (let x = 0; x < map[0].length; x++) {
            fill = true;
            for (let y = 0; y < map.length; y++) {
                if (map[y][x] === 0 && fill) {
                    map[y][x] = fillColor;
                    changed = true;
                }
                fill = map[y][x] === fillColor;
            }
            fill = true;
            for (let y = map.length - 1; y >= 0; y--) {
                if (map[y][x] === 0 && fill) {
                    map[y][x] = fillColor;
                    changed = true;
                }
                fill = map[y][x] === fillColor;
            }
        }
    } while (changed);
};

const getMap = (plan) => {
    let { xValues, yValues } = getMapBounds(plan);
    const map = createMap(xValues.length * 2 - 1, yValues.length * 2 - 1);
    drawMap(plan, map, xValues.indexOf(0), yValues.indexOf(0));
    fillMap(map);
    return [map, xValues, yValues];
};

const countHoles = (map, xValues, yValues) => {
    let count = 0;
    for (let y = 0; y < map.length; y++) {
        let str = '';
        for (let x = 0; x < map[y].length; x++) {
            const hole = map[y][x] !== fillColor;
            if (hole) {
                let xSize = (x % 2 === 1) ? (xValues[(x + 1) / 2] - xValues[(x - 1) / 2] - 1) : 1;
                let ySize = (y % 2 === 1) ? (yValues[(y + 1) / 2] - yValues[(y - 1) / 2] - 1) : 1;
                count = count + xSize * ySize;
                // console.log(`${xSize} * ${ySize} = ${xSize * ySize} -> ${count}`);
                if (!map[y][x]) {
                    map[y][x] = colors[RED];
                }
            }
            str += ansiColor(map[y][x]) + (hole ? '#' : '.');
        }
        console.log(str);
    }
    console.log('\x1b[m');
    return count;
};

const solvePartTwo = (filename) => {
    const plan = getPlan(filename);
    const [map, xValues, yValues] = getMap(plan);
    const holes = countHoles(map, xValues, yValues);
    console.log(`Part 2 result: ${holes}`);
};

solvePartTwo('test.txt');
solvePartTwo('input.txt');
