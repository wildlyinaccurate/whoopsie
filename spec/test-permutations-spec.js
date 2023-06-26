const testPermutations = require("../src/test-permutations");

describe("testPermutations()", () => {
  it("should generate (url, width) tuples", () => {
    const sites = ["http://site-1", "http://site-2"];
    const pages = [{ path: "/test-page" }];
    const widths = [100, 200];

    expect(testPermutations(sites, pages, widths)).toEqual([
      [
        [{ path: "/test-page", url: "http://site-1/test-page" }, 100],
        [{ path: "/test-page", url: "http://site-2/test-page" }, 100],
      ],
      [
        [{ path: "/test-page", url: "http://site-1/test-page" }, 200],
        [{ path: "/test-page", url: "http://site-2/test-page" }, 200],
      ],
    ]);
  });

  it("should allow query parameters and ports in both sites and pages", () => {
    const sites = ["http://site?env=test", "http://site?env=live"];
    const pages = [{ path: "/☃️?p=1" }];
    const widths = [100, 200];

    expect(testPermutations(sites, pages, widths)).toEqual([
      [
        [{ path: "/☃️?p=1", url: "http://site/☃️?env=test&p=1" }, 100],
        [{ path: "/☃️?p=1", url: "http://site/☃️?env=live&p=1" }, 100],
      ],
      [
        [{ path: "/☃️?p=1", url: "http://site/☃️?env=test&p=1" }, 200],
        [{ path: "/☃️?p=1", url: "http://site/☃️?env=live&p=1" }, 200],
      ],
    ]);
  });
});
