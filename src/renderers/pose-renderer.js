// @ts-check
const {
  /* types only */
} = require("./types");

/**
 * Base class for pose rendering
 */
class PoseRenderer {
  /**
   * @param {import("./types").Viewer} viewer
   */
  constructor(viewer) {
    this.viewer = viewer;
  }

  /**
   * @param {number} v
   */
  x(v) {
    const n = v * (this.viewer.width - 2);
    return n / this.viewer.pose.header.width;
  }

  /**
   * @param {number} v
   */
  y(v) {
    const n = v * this.viewer.height;
    return n / this.viewer.pose.header.height;
  }

  /**
   * @param {import("./types").PosePointModel} joint
   * @returns {boolean}
   */
  isJointValid(joint) {
    return joint.C !== undefined && joint.C > 0;
  }

  /**
   * @param {number} i
   * @param {import("./types").PosePointModel} joint
   * @param {import("./types").RGBColor} color
   * @param {number} [avgZ]
   */
  renderJoint(i, joint, color, avgZ) {
    throw new Error("renderJoint() must be implemented in subclass");
  }

  /**
   * @param {import("./types").PosePointModel[]} joints
   * @param {import("./types").RGBColor[]} colors
   * @param {string} name
   */
  renderJoints(joints, colors, name) {
    joints = joints.filter(this.isJointValid.bind(this));
    return joints.map((joint, i) =>
      this.renderJoint(
        i,
        joint,
        colors[i % colors.length],
        name === "LEFT_HAND_LANDMARKS" || name === "RIGHT_HAND_LANDMARKS"
          ? 20
          : undefined
      )
    );
  }

  /**
   * @param {import("./types").PosePointModel} from
   * @param {import("./types").PosePointModel} to
   * @param {import("./types").RGBColor} color
   */
  renderLimb(from, to, color) {
    throw new Error("renderLimb() must be implemented in subclass");
  }

  /**
   * @param {import("./types").PoseLimb[]} limbs
   * @param {import("./types").PosePointModel[]} joints
   * @param {import("./types").RGBColor[]} colors
   * @param {string} name
   */
  renderLimbs(limbs, joints, colors, name) {
    const lines = limbs
      .map(({ from, to }) => {
        let a = joints[from];
        let b = joints[to];
        if (!this.isJointValid(a) || !this.isJointValid(b)) return null;

        const c1 = colors[from % colors.length];
        const c2 = colors[to % colors.length];
        const color = {
          R: (c1.R + c2.R) / 2,
          G: (c1.G + c2.G) / 2,
          B: (c1.B + c2.B) / 2,
        };

        b.Z =
          b.Z &&
          (name === "LEFT_HAND_LANDMARKS" || name === "RIGHT_HAND_LANDMARKS")
            ? b.Z + 5
            : b.Z;

        return { from: a, to: b, color, z: ((a.Z || 0) + (b.Z || 0)) / 2 };
      })
      .filter((line) => line !== null);

    return lines
      .filter(Boolean)
      .sort((a, b) => b.z - a.z)
      .map(({ from, to, color }) => this.renderLimb(from, to, color));
  }

  /**
   * @param {import("./types").PoseBodyFrameModel} frame
   */
  renderFrame(frame) {
    return frame.people.map((person) =>
      this.viewer.pose.header.components.map((component) => {
        const joints = person[component.name];
        return [
          this.renderJoints(joints, component.colors, component.name),
          this.renderLimbs(
            component.limbs,
            joints,
            component.colors,
            component.name
          ),
        ];
      })
    );
  }

  /**
   * @param {import("./types").PoseBodyFrameModel} frame
   */
  render(frame) {
    throw new Error("render() must be implemented in subclass");
  }
}

module.exports = PoseRenderer;
