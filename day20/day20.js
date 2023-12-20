const fs = require('fs');

const FLIP_FLOP_MODULE = '%';
const CONJUNCTION_MODULE = '&';

const parseLine = (machine, line) => {
    let [moduleName, targets] = line.split(' -> ');
    let moduleType = '';
    const match = moduleName.match(/^[%&]/);
    if (match) {
        moduleName = moduleName.substring(1);
        moduleType = match[0];
    }
    targets = targets.split(', ');
    machine.modules ||= {};
    machine.inputs ||= {};
    machine.memory ||= {};
    machine.modules[moduleName] = { moduleType, targets };
    targets.forEach((target) => {
        machine.inputs[target] ||= [];
        machine.inputs[target].push(moduleName);
        machine.memory[moduleName] = false;
    });
    return machine;
};

const getInputData = (filename) => fs.readFileSync(filename).toString().trim().split('\n')
    .map(line => line.trim())
    .filter(str => str !== '')
    .reduce(parseLine, parseLine({ done: false, cycle: 0, high: 0, low: 0, pulse: {} }, 'button -> broadcaster'));

const processModule = (machine, input) => {
    let output;
    switch (machine.modules[input.module].moduleType) {
        case FLIP_FLOP_MODULE:
            if (input.state) {
                return machine; // ignore
            }
            machine.memory[input.module] = !machine.memory[input.module];
            output = machine.memory[input.module];
            break;
        case CONJUNCTION_MODULE:
            machine.memory[input.source] = input.state;
            output = !machine.inputs[input.module].reduce((state, inputModule) => state & machine.memory[inputModule], true);
            if (output && 'rx' in machine.inputs && machine.inputs[machine.inputs.rx].indexOf(input.module) >= 0) {
                machine.result ||= {};
                if (!(input.module in machine.result)) {
                    machine.result[input.module] ||= machine.cycle;
                    if (Object.keys(machine.result).length === machine.inputs[machine.inputs.rx].length) {
                        machine.done = true;
                    }
                }
            }
            break;
        default:
            output = input.state;
            break;
    }
    machine.modules[input.module].targets.forEach((target) => {
        if (output) {
            machine.high++;
        } else {
            machine.low++;
        }
        machine.nextPulse.push({ module: target, source: input.module, state: output });
    });
    return machine;
};

const propagatePulse = (machine) => {
    machine.nextPulse = [];
    machine.pulse.forEach((pulse) => {
        if (pulse.module in machine.modules) {
            processModule(machine, pulse);
        }
    });
    machine.pulse = machine.nextPulse;
    delete machine.nextPulse;
    return machine;
};

const runMachine = (filename) => {
    let machine = getInputData(filename);
    while (machine.cycle < 1000) {
        machine.cycle++;
        machine.pulse = [ { module: 'button', source: '', state: false } ];
        while (machine.pulse.length) {
            machine = propagatePulse(machine);
        }
    }
    return machine.high * machine.low;
};

const factors = (initialNumber) => {
    let factors = {};
    let root = Math.sqrt(initialNumber);
    let number = initialNumber;
    let index = 2;
    while (index <= root) {
        let count = 0;
        while (number % index === 0) {
            number /= index;
            count++;
        }
        if (count) {
            factors[index] = count;
        }
        index++;
    }
    if (number > 1) {
        factors[number] = 1;
    }
    return factors;
};

const lcm = (a, b) => {
    let commonFactors = {};
    let factorsInA = factors(a);
    let factorsInB = factors(b);
    for (const [factor, count] of Object.entries(factorsInA)) {
        if (factor in factorsInB) {
            commonFactors[factor] = Math.max(Number(count), Number(factorsInB[factor]));
        } else {
            commonFactors[factor] = count;
        }
    }
    for (const [factor, count] of Object.entries(factorsInB)) {
        if (!(factor in commonFactors)) {
            commonFactors[factor] = count;
        }
    }
    let result = 1;
    for (const [factor, count] of Object.entries(commonFactors)) {
        result *= Number(factor) * Number(count);
    }
    return result;
}

const calculateButtonPressesForRx = (filename) => {
    let machine = getInputData(filename);
    while (!machine.done) {
        machine.cycle++;
        machine.pulse = [ { module: 'button', source: '', state: false } ];
        while (machine.pulse.length) {
            machine = propagatePulse(machine);
        }
    }
    return Object.values(machine.result).map(a => Number(a)).reduce((a, b) => lcm(a, b), 1);
};

let testResult1 = runMachine('test1.txt');
console.log(`Part 1 result (test #1): ${testResult1}`);

let testResult2 = runMachine('test2.txt');
console.log(`Part 1 result (test #2): ${testResult2}`);

let part1 = runMachine('input.txt');
console.log(`Part 1 result: ${part1}`);

let part2 = calculateButtonPressesForRx('input.txt');
console.log(`Part 2 result: ${part2}`);
