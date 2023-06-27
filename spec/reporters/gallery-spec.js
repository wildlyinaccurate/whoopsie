/* eslint handle-callback-err: "off" */
const proxyquire = require("proxyquire");

const templateSpy = jasmine.createSpy("template").and.returnValue("MOCK HTML");

const galleryReporter = proxyquire("../../src/reporters/gallery", {
  "fs-extra": jasmine.createSpyObj("fs", ["readFile", "writeFile", "copy"]),
  "lodash/fp": {
    template: () => templateSpy,
  },
});

const mockDiff = (percentage) => {
  return {
    diff: {
      percentage,
      imagePath: "/tmp/diff.png",
    },
    base: { imagePath: "/tmp/base.png" },
    test: { imagePath: "/tmp/test.png" },
  };
};

const mockConfig = {
  outDir: "/tmp/whoopsie-test",
  failureThreshold: 10,
};

describe("galleryReporter()", () => {
  beforeEach(() => {
    templateSpy.calls.reset();
  });

  it("should order results by highest difference", (done) => {
    const diff1 = mockDiff(8);
    const diff2 = mockDiff(10);
    const mockOutput = {
      results: [diff1, diff2],
    };

    galleryReporter(mockOutput, mockConfig).then(() => {
      const results = templateSpy.calls.argsFor(0)[0].results;

      expect(results[0].diff.percentage).toEqual(10);
      expect(results[1].diff.percentage).toEqual(8);

      done();
    });
  });

  it("should correctly identify failures based on the threshold", (done) => {
    const mockOutput = {
      results: [mockDiff(8), mockDiff(10)],
    };

    galleryReporter(mockOutput, mockConfig).then(() => {
      const results = templateSpy.calls.argsFor(0)[0].results;

      expect(results[0].failed).toBe(true);
      expect(results[1].failed).toBe(false);

      done();
    });
  });
});
