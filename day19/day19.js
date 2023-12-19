const fs = require('fs');

const getPartCategory = (part, nextPartCategory) => {
    let [category, rating] = nextPartCategory.split('=');
    return { [category]: Number(rating), ...part };
};

const getRule = (rule) => {
    let [condition, destination] = rule.split(':');
    if (destination === undefined) {
        return { destination: condition };
    }
    let c = condition.match(/[<>]/).index;
    if (condition.charAt(c) === '<') {
        return {
            category: condition.substring(0, c),
            lessThan: Number(condition.substring(c + 1)),
            destination,
        }
    }
    return {
        category: condition.substring(0, c),
        greaterThan: Number(condition.substring(c + 1)),
        destination,
    };
};

const parseLine = (inputData, line) => {
    let [rulesStart, rulesEnd] = [line.indexOf('{'), line.indexOf('}')];
    let workflowName = line.substring(0, rulesStart);
    let rules = line.substring(rulesStart + 1, rulesEnd).split(',');
    if (workflowName === '') {
        inputData.parts.push(rules.reduce(getPartCategory, {}));
    } else {
        inputData.workflows[workflowName] = rules.map(getRule);
    }
    return inputData;
};

const getInputData = (filename) => fs.readFileSync(filename).toString().trim().split('\n')
    .map(line => line.trim())
    .filter(str => str !== '')
    .reduce(parseLine, { workflows: {}, parts: [] });

const processRule = (part, rule, destination) => {
    if (destination !== '') {
        return destination;
    }
    if ((!('greaterThan' in rule) || part[rule.category] > rule.greaterThan)
        && (!('lessThan' in rule) || part[rule.category] < rule.lessThan)) {
        return rule.destination;
    }
    return '';
};

const processPart = (part, workflow) => workflow.reduce((destination, rule) => processRule(part, rule, destination), '');

const sumRatings = (part) => Object.values(part).reduce((a, b) => a + b, 0);

const processWorkflows = (part, workflows) => {
    let workflowName = 'in';
    do {
        workflowName = processPart(part, workflows[workflowName]);
    } while (workflowName !== 'A' && workflowName !== 'R');
    return workflowName === 'A' ? sumRatings(part) : 0;
};

const parseRule = (rule, region) => {
    let result = {
        categories: {
            x: { from: region.categories.x.from, to: region.categories.x.to },
            m: { from: region.categories.m.from, to: region.categories.m.to },
            a: { from: region.categories.a.from, to: region.categories.a.to },
            s: { from: region.categories.s.from, to: region.categories.s.to },
        },
        destination: rule.destination,
        discard: region.discard || false,
    };
    let unmatched = {
        categories: {
            x: { from: region.categories.x.from, to: region.categories.x.to },
            m: { from: region.categories.m.from, to: region.categories.m.to },
            a: { from: region.categories.a.from, to: region.categories.a.to },
            s: { from: region.categories.s.from, to: region.categories.s.to },
        },
    };
    if ('greaterThan' in rule && rule.greaterThan > result.categories[rule.category].from) {
        result.categories[rule.category].from = rule.greaterThan + 1;
        unmatched.categories[rule.category].to = rule.greaterThan;
        if (result.categories[rule.category].from > result.categories[rule.category].to) {
            result.discard = true;
        }
        if (unmatched.categories[rule.category].from > unmatched.categories[rule.category].to) {
            unmatched.discard = true;
        }
    }
    if ('lessThan' in rule && rule.lessThan < result.categories[rule.category].to) {
        result.categories[rule.category].to = rule.lessThan - 1;
        unmatched.categories[rule.category].from = rule.lessThan;
        if (result.categories[rule.category].from > result.categories[rule.category].to) {
            result.discard = true;
        }
        if (unmatched.categories[rule.category].from > unmatched.categories[rule.category].to) {
            unmatched.discard = true;
        }
    }
    return [ result, unmatched ];
}

const parseWorkflow = (workflow, region) => {
    const rules = [];
    let unmatched = region;
    let result;
    workflow.forEach((rule) => {
        if (!unmatched.discard) {
            [ result, unmatched ] = parseRule(rule, unmatched);
            if (!result.discard) {
                rules.push(result);
            }
        }
    })
    return rules;
}

const expandRegions = (workflows, regions) => {
    let expanded = [];
    let hasOtherDestination = false;
    regions.forEach((region) => {
        if (region.destination === 'A' || region.destination === 'R') {
            expanded.push(region);
        } else {
            let parsedWorkflow = parseWorkflow(workflows[region.destination], region);
            expanded.push(...expandRegions(workflows, parsedWorkflow));
        }
    });
    return expanded;
};

const regionSize = (region) => (region.destination === 'A') ?
    (
        (1 + region.categories.x.to - region.categories.x.from)
        * (1 + region.categories.m.to - region.categories.m.from)
        * (1 + region.categories.a.to - region.categories.a.from)
        * (1 + region.categories.s.to - region.categories.s.from)
    ) : 0;

const countAcceptedCombinations = (inputData) => {
    let region = {
        categories: {
            x: { from: 1, to: 4000 },
            m: { from: 1, to: 4000 },
            a: { from: 1, to: 4000 },
            s: { from: 1, to: 4000 },
        },
        destination: 'in',
    }
    return expandRegions(inputData.workflows, [region]).map(regionSize).reduce((a, b) => a + b, 0);
}

const testData = getInputData("test.txt");
const testPart1Sum = testData.parts.reduce((tally, part) => processWorkflows(part, testData.workflows) + tally, 0);
console.log(`Part 1 result (test): ${testPart1Sum}`);
const testPart2Sum = countAcceptedCombinations(testData);
console.log(`Part 2 result (test): ${testPart2Sum}`);

const inputData = getInputData("input.txt");
const part1sum = inputData.parts.reduce((tally, part) => processWorkflows(part, inputData.workflows) + tally, 0);
console.log(`Part 1 result: ${part1sum}`);
const part2Sum = countAcceptedCombinations(inputData);
console.log(`Part 2 result: ${part2Sum}`);
