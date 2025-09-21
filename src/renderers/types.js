/**
 * @typedef {Object} RGBColor
 * @property {number} R
 * @property {number} G
 * @property {number} B
 */

/**
 * @typedef {Object} PoseLimb
 * @property {number} from
 * @property {number} to
 */

/**
 * @typedef {Object} PosePointModel
 * @property {number} X
 * @property {number} Y
 * @property {number} [Z]
 * @property {number} [C]
 */

/**
 * @typedef {Object} PoseHeaderComponentModel
 * @property {string} name
 * @property {string} format
 * @property {number} _points
 * @property {number} _limbs
 * @property {number} _colors
 * @property {string[]} points
 * @property {PoseLimb[]} limbs
 * @property {RGBColor[]} colors
 */

/**
 * @typedef {Object} PoseHeaderModel
 * @property {number} version
 * @property {number} width
 * @property {number} height
 * @property {number} depth
 * @property {number} _components
 * @property {PoseHeaderComponentModel[]} components
 * @property {number} headerLength
 */

/**
 * @typedef {Object.<string, PosePointModel[]>} PoseBodyFramePersonModel
 */

/**
 * @typedef {Object} PoseBodyFrameModel
 * @property {number} _people
 * @property {PoseBodyFramePersonModel[]} people
 */

/**
 * @typedef {Object} PoseBodyModel
 * @property {number} fps
 * @property {number} _frames
 * @property {PoseBodyFrameModel[]} frames
 */

/**
 * @typedef {Object} PoseModel
 * @property {PoseHeaderModel} header
 * @property {PoseBodyModel} body
 */

/**
 * @typedef {Object} Viewer
 * @property {number} width
 * @property {number} height
 * @property {PoseModel} pose
 */
module.exports = {};
