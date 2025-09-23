const { Parser } = require("binary-parser");
function newParser() {
  return new Parser().endianess("little");
}
function componentHeaderParser() {
  const limbParser = newParser().uint16("from").uint16("to");
  const colorParser = newParser().uint16("R").uint16("G").uint16("B");
  const strParser = newParser()
    .uint16("_chars")
    .string("text", { length: "_chars" });
  return newParser()
    .uint16("_name")
    .string("name", { length: "_name" })
    .uint16("_format")
    .string("format", { length: "_format" })
    .uint16("_points")
    .uint16("_limbs")
    .uint16("_colors")
    .array("points", {
      type: strParser,
      formatter: (arr) => arr.map((item) => item.text),
      length: "_points",
    })
    .array("limbs", {
      type: limbParser,
      length: "_limbs",
    })
    .array("colors", {
      type: colorParser,
      length: "_colors",
    });
}
function getHeaderParser() {
  const componentParser = componentHeaderParser();
  return (
    newParser()
      .floatle("version")
      .uint16("width")
      .uint16("height")
      .uint16("depth")
      .uint16("_components")
      .array("components", {
        type: componentParser,
        length: "_components",
      })
      // @ts-ignore
      .saveOffset("headerLength")
  );
}
function getBodyParserV0_0(header) {
  let personParser = newParser().int16("id");
  header.components.forEach((component) => {
    let pointParser = newParser();
    Array.from(component.format).forEach((c) => {
      pointParser = pointParser.floatle(c);
    });
    personParser = personParser.array(component.name, {
      type: pointParser,
      length: component._points,
    });
  });
  const frameParser = newParser().uint16("_people").array("people", {
    type: personParser,
    length: "_people",
  });
  return newParser()
    .seek(header.headerLength)
    .uint16("fps")
    .uint16("_frames")
    .array("frames", {
      type: frameParser,
      length: "_frames",
    });
}
function parseBodyV0_0(header, buffer) {
  return getBodyParserV0_0(header).parse(buffer);
}
function parseBodyV0_1(header, buffer, version) {
  const _points = header.components
    .map((c) => c.points.length)
    .reduce((a, b) => a + b, 0);
  const _dims = Math.max(...header.components.map((c) => c.format.length)) - 1;
  let infoParser = newParser().seek(header.headerLength);
  let infoSize = 0;
  if (version === 0.1) {
    infoParser = infoParser.uint16("fps").uint16("_frames");
    infoSize = 6;
  } else if (version === 0.2) {
    infoParser = infoParser.floatle("fps").uint32("_frames");
    infoSize = 10;
  } else {
    throw new Error(`Invalid version ${version}`);
  }
  infoParser = infoParser.uint16("_people");
  const info = infoParser.parse(buffer);
  // Issue https://github.com/keichi/binary-parser/issues/208
  const parseFloat32Array = (length, offset) => {
    const dataView = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.length
    );
    let currentOffset = offset;
    const vars = {
      data: new Float32Array(length),
      offset: 0,
    };
    for (let i = 0; i < vars.data.length; i++) {
      let $tmp1 = dataView.getFloat32(currentOffset, true);
      currentOffset += 4;
      vars.data[i] = $tmp1;
    }
    vars.offset = currentOffset;
    return vars;
  };
  const data = parseFloat32Array(
    info._frames * info._people * _points * _dims,
    header.headerLength + infoSize
  );
  const confidence = parseFloat32Array(
    info._frames * info._people * _points,
    data.offset
  );
  function frameRepresentation(i) {
    const people = new Array(info._people);
    for (let j = 0; j < info._people; j++) {
      const person = {};
      people[j] = person;
      let k = 0;
      header.components.forEach((component) => {
        person[component.name] = [];
        for (let l = 0; l < component.points.length; l++) {
          const offset = i * (info._people * _points) + j * _points;
          const place = offset + k + l;
          const point = { C: confidence.data[place] };
          [...component.format].forEach((dim, dimIndex) => {
            if (dim !== "C") {
              point[dim] = data.data[place * _dims + dimIndex];
            }
          });
          person[component.name].push(point);
        }
        k += component.points.length;
      });
    }
    return { people };
  }
  const frames = new Proxy(
    {},
    {
      get: function (target, name) {
        if (name === "length") {
          return info._frames;
        }

        // Convert string key to number safely
        const index = Number(name);
        if (Number.isNaN(index)) {
          return undefined; // or throw, depending on your use case
        }

        if (index < 0 || index >= info._frames) {
          throw new RangeError(`Frame index ${index} out of bounds`);
        }

        return frameRepresentation(index);
      },
    }
  );
  return Object.assign(Object.assign({}, info), { frames });
}
const headerParser = getHeaderParser();
function parsePose(buffer) {
  const header = headerParser.parse(buffer);
  let body;
  const version = Math.round(header.version * 1000) / 1000;
  switch (version) {
    case 0:
      body = parseBodyV0_0(header, buffer);
      break;
    case 0.1:
    case 0.2:
      body = parseBodyV0_1(header, buffer, version);
      break;
    default:
      throw new Error(
        "Parsing this body version is not implemented - " + header.version
      );
  }
  return { header, body };
}

module.exports = {
  parsePose,
};
