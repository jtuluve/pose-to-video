const { createCanvas } = require("canvas");
const PoseRenderer = require("./pose-renderer.js");
/**
 * @typedef {import("./types").Viewer} Viewer
 * @typedef {import("./types").PosePointModel} PosePointModel
 * @typedef {import("./types").PoseBodyFrameModel} PoseBodyFrameModel
 * @typedef {import("./types").RGBColor} RGBColor
 */

class CanvasPoseRenderer extends PoseRenderer {
  /**
   * @param {Viewer} viewer
   */
  constructor(viewer) {
    super(viewer);

    this.canvas = createCanvas(viewer.width, viewer.height);
    this.ctx = this.canvas.getContext("2d");
    this.thickness = 1;
  }

  /**
   *
   * @param {number} v
   * @returns {number}
   */
  x(v) {
    const n = v * (this.viewer.width - 2 * (this.viewer.elPadding?.width || 0));
    return (
      n / this.viewer.pose.header.width + (this.viewer.elPadding?.width || 0)
    );
  }

  y(v) {
    const n =
      v * (this.viewer.height - 2 * (this.viewer.elPadding?.height || 0));
    return (
      n / this.viewer.pose.header.height + (this.viewer.elPadding?.height || 0)
    );
  }

  isJointValid(joint) {
    return joint.C > 0;
  }

  /**
   *
   * @param {*} _
   * @param {} joint
   * @param {RGBColor} color
   */
  renderJoint(_, joint, color) {
    const { R, G, B } = color;
    this.ctx.strokeStyle = "rgba(0,0,0,0)";
    this.ctx.fillStyle = `rgba(${R}, ${G}, ${B}, ${joint.C})`;

    const radius = Math.round(this.thickness / 3);
    this.ctx.beginPath();
    this.ctx.arc(this.x(joint.X), this.y(joint.Y), radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }

  renderLimb(from, to, color) {
    const { R, G, B } = color;
    this.ctx.lineWidth = (this.thickness * 5) / 4;
    this.ctx.strokeStyle = `rgba(${R}, ${G}, ${B}, ${(from.C + to.C) / 2})`;

    this.ctx.beginPath();
    this.ctx.moveTo(this.x(from.X), this.y(from.Y));
    this.ctx.lineTo(this.x(to.X), this.y(to.Y));
    this.ctx.stroke();
  }

  renderFrame(frame) {
    frame.people.forEach((person) => {
      this.viewer.pose.header.components.forEach((component) => {
        const joints = person[component.name];
        if (!joints) return;

        // Render joints
        joints.filter(this.isJointValid.bind(this)).forEach((joint, i) => {
          this.renderJoint(
            i,
            joint,
            component.colors[i % component.colors.length]
          );
        });

        // Render limbs
        component.limbs.forEach(({ from, to }) => {
          const a = joints[from];
          const b = joints[to];
          if (!this.isJointValid(a) || !this.isJointValid(b)) return;

          const c1 = component.colors[from % component.colors.length];
          const c2 = component.colors[to % component.colors.length];
          const color = {
            R: (c1.R + c2.R) / 2,
            G: (c1.G + c2.G) / 2,
            B: (c1.B + c2.B) / 2,
          };

          this.renderLimb(a, b, color);
        });
      });
    });
  }

  render(frame) {
    // reset canvas
    this.canvas.width = this.viewer.width;
    this.canvas.height = this.viewer.height;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const w = this.viewer.width;
    const h = this.viewer.height;
    this.thickness = Math.round(Math.sqrt(w * h) / 150);

    this.renderFrame(frame);

    // return the node-canvas object so you can save or stream it
    return this.canvas;
  }
}

module.exports = { CanvasPoseRenderer };
