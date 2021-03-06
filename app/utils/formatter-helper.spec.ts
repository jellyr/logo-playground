import { getFileExtension, parseDateFromJson, stringifyDateAsJson } from "./formatter-helper";

describe("FormatterHelper", () => {
  it("should extract file extension properly", () => {
    chai.expect(getFileExtension("model.ttl")).to.be.eql("ttl");
    chai.expect(getFileExtension("model.TTL")).to.be.eql("ttl");
    chai.expect(getFileExtension("model.2.ttl")).to.be.eql("ttl");
    chai.expect(getFileExtension("model...")).to.be.eql("");
    chai.expect(getFileExtension("model")).to.be.eql("");
    chai.expect(getFileExtension("")).to.be.eql("");
    chai.expect(getFileExtension(null as any)).to.be.eql("");
    chai.expect(getFileExtension(undefined as any)).to.be.eql("");
  });

  it("stringifyDateAsJson works properly", () => {
    const dateStr = "2017-01-12T08:56:25.260Z";
    const dateObj = new Date(dateStr);
    const dateStr2 = stringifyDateAsJson(dateObj);
    chai.expect(dateStr2).to.be.eql(dateStr);
  });

  it("parseDateFromJson parses dates properly", () => {
    const now = new Date();
    const nowStr = stringifyDateAsJson(now);
    const now2 = parseDateFromJson(nowStr);
    chai.expect(now2).to.be.eql(now);
  });
});
