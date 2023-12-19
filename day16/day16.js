const fs = require('fs');

const getMap = (filename) => fs.readFileSync(filename).toString().trim().split('\n')
    .map(str => str.trim().split('')
        .map(c => { return { chr: c, count: 0, visited: new Array(4).fill(0) } }));

const dir = (dx, dy) => {
    switch (dx + dy * 2) {
        case -2:
            return 0;
        case 1:
            return 1;
        case 2:
            return 2;
        case -1:
            return 3;
    }
}
const nextPaths = (map, path) => {
    const [nx, ny] = [path.x + path.dx, path.y + path.dy];
    if (nx < 0 || ny < 0 || ny >= map.length || nx >= map[ny].length) {
        return [];
    }
    const chr = map[ny][nx]['chr'];
    switch (chr) {
        case '|':
            if (path.dx) {
                return [{ x: nx, y: ny, dx: 0, dy: -1 }, { x: nx, y: ny, dx: 0, dy: 1 }];
            } else {
                return [{ x: nx, y: ny, dx: path.dx, dy: path.dy }];
            }
        case '-':
            if (path.dy) {
                return [{ x: nx, y: ny, dx: -1, dy: 0 }, { x: nx, y: ny, dx: 1, dy: 0 }];
            } else {
                return [{ x: nx, y: ny, dx: path.dx, dy: path.dy }];
            }
        case '\\':
            return [{ x: nx, y: ny, dx: path.dy, dy: path.dx }];
        case '/':
            return [{ x: nx, y: ny, dx: -path.dy, dy: -path.dx }];
        default:
            return [{ x: nx, y: ny, dx: path.dx, dy: path.dy }];
    }
};

const travel = (map, start) => {
    let paths = nextPaths(map, start);
    while (paths.length) {
        const next = [];
        paths.forEach((path) => {
            map[path.y][path.x].count++;
            const d = dir(path.dx, path.dy);
            if (map[path.y][path.x].visited[d] === 0) {
                next.push(...nextPaths(map, path));
            }
            map[path.y][path.x].visited[d]++;
        });
        paths = next;
    }
}

const countEnergizedTiles = (map) => map
    .map(array => array.reduce((a, b) => a + (b.count === 0 ? 0 : 1), 0))
    .reduce((a, b) => a + b, 0);

const solveForPart1 = (filename) => {
    const map = getMap(filename);
    travel(map, { x: -1, y: 0, dx: 1, dy: 0 });
    return countEnergizedTiles(map);
}

const resetMap = (map) => {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            map[y][x] = { chr: map[y][x].chr, count: 0, visited: new Array(4).fill(0) };
        }
    }
}

const solveForPart2 = (filename) => {
    const map = getMap(filename);
    const results = [];
    for (let y = 0; y < map.length; y++) {
        travel(map, { x: -1, y, dx: 1, dy: 0 });
        results.push(countEnergizedTiles(map));
        resetMap(map);
        travel(map, { x: map[y].length, y, dx: -1, dy: 0 });
        results.push(countEnergizedTiles(map));
        resetMap(map);
    }
    for (let x = 0; x < map[0].length; x++) {
        travel(map, { x, y: -1, dx: 0, dy: 1 });
        results.push(countEnergizedTiles(map));
        resetMap(map);
        travel(map, { x, y: map.length, dx: 0, dy: -1 });
        results.push(countEnergizedTiles(map));
        resetMap(map);
    }
    return results.reduce((a, b) => a > b ? a : b, 0);
}

console.log(`Test part 1: ${solveForPart1("test.txt")}`);
console.log(`Part 1: ${solveForPart1("input.txt")}`);

console.log(`Test part 2: ${solveForPart2("test.txt")}`);
console.log(`Part 1: ${solveForPart2("input.txt")}`);
