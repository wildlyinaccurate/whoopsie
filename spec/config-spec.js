const config = require("../src/config");

const minimumValidConfig = {
  sites: ["site1", "site2"],
  viewports: [{ width: 200 }, { width: 300 }],
  pages: [{ path: "/" }],
};

describe("config.processFile()", () => {
  it("should accept a valid config file", (done) => {
    config.processFile("config/sample.yml").then(done);
  });

  it("should reject an invalid config file", (done) => {
    config.processFile("spec/support/invalid-config.yml").catch(done);
  });

  it("should reject when the file does not exist", (done) => {
    config.processFile("-").catch(done);
  });
});

describe("config.process()", () => {
  it("should accept a minimum valid config", (done) => {
    config.process(minimumValidConfig).then((actualConfig) => {
      expect(actualConfig).toEqual(jasmine.objectContaining(minimumValidConfig));
      done();
    });
  });

  it("should reject config with no sites", (done) => {
    config.process(modifyConfig({ sites: [] })).catch(done);
  });

  it("should reject config with one site", (done) => {
    config.process(modifyConfig({ sites: ["site1"] })).catch(done);
  });

  it("should reject config with more than two sites", (done) => {
    config.process(modifyConfig({ sites: ["site1", "site2", "site3"] })).catch(done);
  });

  it("should reject config with no viewports", (done) => {
    config.process(modifyConfig({ viewports: [] })).catch(done);
  });

  it("should reject config with no pages", (done) => {
    config.process(modifyConfig({ pages: [] })).catch(done);
  });

  it("should accept a config with optional values", (done) => {
    config
      .process(
        modifyConfig({
          headless: true,
          fuzz: 5,
        })
      )
      .then(done);
  });
});

function modifyConfig(changes) {
  return { ...minimumValidConfig, ...changes };
}
