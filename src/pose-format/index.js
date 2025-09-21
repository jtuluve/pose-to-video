const { Buffer } = require("buffer");
const { parsePose } = require("./parser.js");
const fs = require("fs");
class Pose {
  constructor(header, body) {
    this.header = header;
    this.body = body;
  }
  static from(buffer) {
    const pose = parsePose(buffer);
    return new Pose(pose.header, pose.body);
  }
  static async fromLocal(path) {
    const buffer = fs.readFileSync(path);
    return Pose.from(buffer);
  }
  static async fromRemote(url, abortController) {
    var _a;
    const init = {};
    if (abortController) {
      init.signal = abortController.signal;
    }
    const res = await fetch(url, init);
    if (!res.ok) {
      let message =
        (_a = res.statusText) !== null && _a !== void 0
          ? _a
          : String(res.status);
      try {
        const json = await res.json();
        message = json.message;
      } catch (e) {}
      throw new Error(message);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    return Pose.from(buffer);
  }
}

module.exports = { Pose };
