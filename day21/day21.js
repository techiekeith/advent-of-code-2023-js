const fs = require('fs');
const { Buffer } = require('buffer');

const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST  = 3;

const DIRS = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
];

const getMap = (filename, replaceChar) => fs.readFileSync(filename)
    .toString().trim().split('\n').map(str => str.trim().split('').map(chr => chr === 'S' ? replaceChar : chr));

const copyMap = (map) => Array.from(Array(map.length),
    (elem, idx) => Array.from(map[idx], (elem) => (elem === '#' ? '#' : '.')));

const findChar = (map, chr) => map.reduce((init, row, idx) => init.x >= 0 ? init : { y: idx, x: row.indexOf(chr) }, { y: 0, x: 0 });

const takeSingleStep = (map) => {
    const copy = copyMap(map);
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            for (let dir = 0; dir < 4; dir++) {
                [nx, ny] = [x + DIRS[dir].dx, y + DIRS[dir].dy];
                if (nx >= 0 && ny >= 0 && ny < map.length && nx < map[ny].length && map[y][x] === 'O' && copy[ny][nx] === '.') {
                    copy[ny][nx] = 'O';
                }
            }
        }
    }
    return copy;
};

const takeSteps = (map, iterations) => {
    let state = map;
    for (let i = 0; i < iterations; i++) {
        state = takeSingleStep(state);
    }
    return state;
};

const countMaxSteps = (map) => {
    const states = [{ steps: 0, count: 0 }, { steps: 0, count: 0 }];
    let count = 0;
    let state = map;
    while (true) {
        state = takeSingleStep(state);
        let plots = countPlots(state);
        if (states[0].count === plots) {
            break;
        }
        count++;
        states[0].steps = count;
        states[0].count = plots;
        state = takeSingleStep(state);
        plots = countPlots(state);
        if (states[1].count === plots) {
            break;
        }
        count++;
        states[1].steps = count;
        states[1].count = plots;
    }
    return states;
};

const findBounds = (map) => {
    let bounds = Array.from(new Array(4), () => { return { count: 0, x: 0, y: 0 }});
    let count = 0;
    let state = map;
    let found = 0;
    while (found < 4) {
        state = takeSingleStep(state);
        count++;
        for (let y = 0; y < state.length; y++) {
            console.log(`count: ${count} y: ${y} left: ${state[y][0]} right: ${state[y][state[y].length - 1]}`)
            if (state[y][0] === 'O' && !bounds[WEST].count) {
                bounds[WEST] = { count: count + 1, x: state[y].length - 1, y };
                found++;
            }
            if (state[y][state[y].length - 1] === 'O' && !bounds[EAST].count) {
                bounds[EAST] = { count: count + 1, x: 0, y };
                found++;
            }
        }
        for (let x = 0; x < state[0].length; x++) {
            if (state[0][x] === 'O' && !bounds[NORTH].count) {
                bounds[NORTH] = { count: count + 1, x, y: state.length - 1 };
                found++;
            }
            if (state[state.length - 1][x] === 'O' && !bounds[SOUTH].count) {
                bounds[SOUTH] = { count: count + 1, x, y: 0 };
                found++;
            }
        }
        console.log(`count: ${count} found: ${found} bounds: ${JSON.stringify(bounds)}`);
    }
    return bounds;
}

const countPlots = (map) => map.reduce((init, row) => init + row.reduce((init, chr) => init + (chr === 'O' ? 1 : 0), 0), 0);

const test1Map = getMap('test.txt', 'O');
console.log(`Part 1 (test, steps=6): ${countPlots(takeSteps(test1Map, 6))}`);

const part1Map = getMap('input.txt', 'O');
console.log(`Part 1 (test, steps=64): ${countPlots(takeSteps(part1Map, 64))}`);

const testStates = countMaxSteps(test1Map);
console.log(`Part 2 (test, steps=${testStates[0].steps}): ${testStates[0].count}`);
console.log(`Part 2 (test, steps=${testStates[1].steps}): ${testStates[1].count}`);

const bounds = findBounds(test1Map);
console.log(bounds);

const states = countMaxSteps(part1Map);
console.log(`Part 2 (steps=${states[0].steps}): ${states[0].count}`);
console.log(`Part 2 (steps=${states[1].steps}): ${states[1].count}`);
