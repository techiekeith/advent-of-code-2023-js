const fs = require('fs');

const dirs = {
    'R': { dx: 1, dy: 0 },
    'D': { dx: 0, dy: 1 },
    'L': { dx: -1, dy: 0 },
    'U': { dx: 0, dy: -1 },
};

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

const ansiColor = (rgb) => `\x1b[38;2;${rgb >> 16};${(rgb >> 8) & 0xff};${rgb & 0xff}m`;

const parseRow = (row) => {
    let [dir, count, rgb] = row.trim().split(' ');
    return { dir, count, rgb: parseInt(rgb.substring(2, 8), 16) };
};

const getPlan = (filename) => fs.readFileSync(filename).toString().trim().split('\n')
    .map(parseRow);

const getMapBounds = (plan) => {
    let [minX, minY, maxX, maxY, x, y] = new Array(6).fill(0);
    let fillColor = 1;
    plan.forEach((row) => {
        [x, y] = [x + dirs[row.dir].dx * row.count, y + dirs[row.dir].dy * row.count];
        if (minX > x) { minX = x; }
        if (maxX < x) { maxX = x; }
        if (minY > y) { minY = y; }
        if (maxY < y) { maxY = y; }
        if (row.rgb === colors[fillColor]) {
            fillColor++;
        }
    });
    return [-minX, -minY, (maxX - minX) + 1, (maxY - minY) + 1, colors[fillColor]];
};

const createMap = (sizeX, sizeY) => Array.from(Array(sizeY), () => new Array(sizeX).fill(0));

const drawMap = (plan, map, offsetX, offsetY) => {
    let [x, y] = [offsetX, offsetY];
    plan.forEach((row) => {
        for (let i = 0; i < row.count; i++) {
            [x, y] = [x + dirs[row.dir].dx, y + dirs[row.dir].dy];
            map[y][x] = row.rgb;
        }
    });
};

const fillMap = (map, fillColor) => {
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
    let [offsetX, offsetY, sizeX, sizeY, fillColor] = getMapBounds(plan);
    const map = createMap(sizeX, sizeY);
    drawMap(plan, map, offsetX, offsetY);
    fillMap(map, fillColor);
    return [map, fillColor];
};

const countHoles = (map, fillColor) => {
    let count = 0;
    for (let y = 0; y < map.length; y++) {
        let str = '';
        for (let x = 0; x < map[y].length; x++) {
            const hole = map[y][x] !== fillColor;
            if (hole) {
                count++;
            }
            str += ansiColor(map[y][x]) + (hole ? '#' : '.');
        }
        console.log(str);
    }
    console.log('\x1b[m');
    return count;
};

const solvePartOne = (filename) => {
    const plan = getPlan(filename);
    const [map, fillColor] = getMap(plan);
    const holes = countHoles(map, fillColor);
    console.log(`Part 1 result: ${holes}`);
};

solvePartOne('test.txt');
solvePartOne('input.txt');
