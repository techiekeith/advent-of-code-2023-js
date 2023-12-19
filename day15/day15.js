const fs = require('fs');

const loadFile = (filename) => fs.readFileSync(filename).toString().replaceAll("\r", "").replaceAll("\n", "");

const hash = (str) => str.split('').map(c => c.charCodeAt(0)).reduce((a, b) => ((a + b) * 17) % 256, 0);

const testHash = () => {
  const result = hash("HASH");
  console.log(`hash("HASH") = ${result} (should be 52)`);
};

const parseInitializationSequence = (sequence) => sequence.split(',').map(step => hash(step)).reduce((a, b) => a + b, 0);

const testPart1 = () => {
  const testSequence = loadFile("test.txt");
  const result = parseInitializationSequence(testSequence);
  console.log(`parseInitializationSequence(<test sequence>) = ${result} (should be 1320)`);
};

const addOrReplaceLens = (box, label, focalLength) => {
  const found = box.findIndex(lens => lens.label === label);
  if (found >= 0) {
    box[found].focalLength = focalLength;
  } else {
    box.push({ label, focalLength });
  }
  return box;
};

const testAddOrReplaceLens = () => {
  let box = addOrReplaceLens([], "cm", 2);
  console.log(`box.length = ${box.length} (should be 1)`);
  console.log(`box[0].label = ${box[0].label} (should be "cm")`);
  console.log(`box[0].focalLength = ${box[0].focalLength} (should be 2)`);

  box.push({ label: "ot", focalLength: 9 });
  box = addOrReplaceLens(box, "ot", 7);
  console.log(`box.length = ${box.length} (should be 2)`);
  console.log(`box[0].label = ${box[0].label} (should be "cm")`);
  console.log(`box[0].focalLength = ${box[0].focalLength} (should be 2)`);
  console.log(`box[1].label = ${box[1].label} (should be "ot")`);
  console.log(`box[1].focalLength = ${box[1].focalLength} (should be 7)`);

  box = addOrReplaceLens(box, "cm", 4);
  console.log(`box.length = ${box.length} (should be 2)`);
  console.log(`box[0].label = ${box[0].label} (should be "cm")`);
  console.log(`box[0].focalLength = ${box[0].focalLength} (should be 4)`);
  console.log(`box[1].label = ${box[1].label} (should be "ot")`);
  console.log(`box[1].focalLength = ${box[1].focalLength} (should be 7)`);
};

const removeLens = (box, label) => box.filter(lens => lens.label !== label);

const testRemoveLens = () => {
  let box = removeLens([], "cm");
  console.log(`box.length = ${box.length} (should be 0)`);

  box.push({ label: "ot", focalLength: 9 });
  box = removeLens(box, "ot");
  console.log(`box.length = ${box.length} (should be 0)`);

  box.push({ label: "pc", focalLength: 9 });
  box.push({ label: "ot", focalLength: 2 });
  box.push({ label: "ab", focalLength: 4 });
  box = removeLens(box, "ot");
  console.log(`box.length = ${box.length} (should be 2)`);
  console.log(`box[0].label = ${box[0].label} (should be "pc")`);
  console.log(`box[0].focalLength = ${box[0].focalLength} (should be 9)`);
  console.log(`box[1].label = ${box[1].label} (should be "ab")`);
  console.log(`box[1].focalLength = ${box[1].focalLength} (should be 4)`);
};

const runStep = (boxes, operation) => {
  const [label, focalLength] = operation.split(/[=-]/);
  const boxNumber = hash(label);
  const box = boxes[boxNumber] || [];
  if (focalLength.length > 0) {
    boxes[boxNumber] = addOrReplaceLens(box, label, focalLength);
  } else {
    boxes[boxNumber] = removeLens(box, label);
  }
  return boxes;
};

const runSteps = (sequence) => {
  let boxes = [];
  sequence.split(",").map(step => {
    boxes = runStep(boxes, step);
  });
  return boxes;
};

const testRunSteps = () => {
  const testSequence = loadFile("test.txt");
  const boxes = runSteps(testSequence);

  console.log(`boxes[0].length = ${boxes[0].length} (should be 2)`);
  console.log(`boxes[0][0].label = ${boxes[0][0].label} (should be "rn")`);
  console.log(`boxes[0][0].focalLength = ${boxes[0][0].focalLength} (should be 1)`);
  console.log(`boxes[0][1].label = ${boxes[0][1].label} (should be "cm")`);
  console.log(`boxes[0][1].focalLength = ${boxes[0][1].focalLength} (should be 2)`);
  console.log(`boxes[3].length = ${boxes[3].length} (should be 3)`);
  console.log(`boxes[3][0].label = ${boxes[3][0].label} (should be "ot")`);
  console.log(`boxes[3][0].focalLength = ${boxes[3][0].focalLength} (should be 7)`);
  console.log(`boxes[3][1].label = ${boxes[3][1].label} (should be "ab")`);
  console.log(`boxes[3][1].focalLength = ${boxes[3][1].focalLength} (should be 5)`);
  console.log(`boxes[3][2].label = ${boxes[3][2].label} (should be "pc")`);
  console.log(`boxes[3][2].focalLength = ${boxes[3][2].focalLength} (should be 6)`);
};

const totalFocusingPower = (sequence) => runSteps(sequence)
  .map((box, boxNumber) => box
    .map((lens, slotNumber) => (boxNumber + 1) * (slotNumber + 1) * lens.focalLength)
    .reduce((a, b) => a + b, 0))
  .reduce((a, b) => a + b, 0);

const testTotalFocusingPower = () => {
  const testSequence = loadFile("test.txt");
  const result = totalFocusingPower(testSequence);

  console.log(`totalFocusingPower(<test sequence>) = ${result} (should be 145)`);
};

const test = () => {
  console.log("*********");
  console.log("* TESTS *");
  console.log("*********");
  testHash();
  testPart1();
  testAddOrReplaceLens();
  testRemoveLens();
  testRunSteps();
  testTotalFocusingPower();
  console.log("******************");
  console.log("* TESTS COMPLETE *");
  console.log("******************");
  console.log("");
}

test();

const part1 = parseInitializationSequence(loadFile("input.txt"));
console.log(`Part 1 result = ${part1}`);

const part2 = totalFocusingPower(loadFile("input.txt"));
console.log(`Part 2 result = ${part2}`);
