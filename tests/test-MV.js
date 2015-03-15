const rounder = (num) => Math.round(num * Math.pow(10,3))/Math.pow(10,3);

QUnit.module("MV");
QUnit.test("::MV", (assert) => {
  assert.ok(window.MV, "MV should be declared in the window obj");
});

QUnit.test("::bisect", (assert) => {
  assert.deepEqual(window.MV.bisect([0,0], [0,0], 0.5),
                   [0,0],
                   "bissect in the same point two equal points");
  assert.deepEqual(window.MV.bisect([-0.5,0], [0.5,0], 0.5),
                   [0,0],
                   "bissect to the middle of a line");
});

QUnit.test("::flatten", (assert) => {
  assert.deepEqual(window.MV.flatten([0,0]),
                   [0,0],
                   "flatten an already flat array");
  assert.deepEqual(window.MV.flatten([0.0,[0.0, [0.0]]]),
                   [0.0, 0.0, 0.0],
                   "flatten a nested array");
});

QUnit.test("::flatten32f", (assert) => {
  assert.deepEqual(window.MV.flatten32f([0.0,[0.0, [0.0]]]),
                   new Float32Array([0.0, 0.0, 0.0]),
                   "flatten a nested array");
  assert.ok(window.MV.flatten32f([0.0,[0.0, [0.0]]]) instanceof Float32Array,
                   "should result in a Float32Array");
});

QUnit.test("::mat4::scale", (assert) => {
  assert.deepEqual(window.MV.flatten32f([0.0,[0.0, [0.0]]]),
                   new Float32Array([0.0, 0.0, 0.0]),
                   "flatten a nested array");
  assert.ok(window.MV.flatten32f([0.0,[0.0, [0.0]]]) instanceof Float32Array,
                   "should result in a Float32Array");
});

