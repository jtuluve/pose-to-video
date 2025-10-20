const { Pose } = require("./pose-format/index.js");
const { CanvasPoseRenderer } = require("./renderers/canvas.pose-renderer.js");
const { mkdirSync, rmSync } = require("fs");
const { writeFile } = require("fs/promises");
const { spawn } = require("child_process");
const { randomBytes } = require("crypto");
const ffmpegPath = require("ffmpeg-static");

/**
 * Cleans and validates pose data.
 * Returns a sanitized pose or null if invalid.
 * @param {Pose} pose - The pose JSON object to clean
 * @returns {Pose|null} - Cleaned pose or null if invalid
 */
function cleanPoseJson(pose) {
  if (!pose || typeof pose !== "object") {
    console.warn("❌ Invalid pose: not an object");
    return null;
  }

  if (!pose.header || !pose.body) {
    console.warn("❌ Pose missing header or body");
    return null;
  }

  if (typeof pose.body.fps !== "number") {
    console.warn("❌ Pose body.fps is missing or not a number");
    return null;
  }

  const frames = [];
  for (let f = 0; f < pose.body._frames; f++) {
    const frame = pose.body.frames[f];
    let isValid = true;

    if (!Array.isArray(frame.people)) {
      console.warn(`⚠ Frame ${f}: Missing or invalid 'people' array`);
      continue;
    }

    for (const person of frame.people) {
      for (const component of pose.header.components) {
        const points = person[component.name];
        if (
          !Array.isArray(points) ||
          points.length !== component.points.length
        ) {
          isValid = false;
          break;
        }

        for (const point of points) {
          if (Object.keys(point).length !== component.format.length) {
            isValid = false;
            break;
          }

          for (const key of component.format) {
            if (!(key in point)) {
              isValid = false;
              break;
            }
            if (key !== "C" && typeof point[key] !== "number") {
              isValid = false;
              break;
            }
          }
          if (!isValid) break;
        }
        if (!isValid) break;
      }
      if (!isValid) break;
    }

    if (isValid) frames.push(frame);
  }

  console.log(
    `✅ ${frames.length}/${pose.body.frames.length} valid frames found`
  );
  pose.body.frames = frames;
  pose.body._frames = frames.length;
  return pose;
}

/**
 * Helper: Render frames and save them to disk
 * @param {Pose} pose - The pose object containing frames
 * @param {CanvasPoseRenderer} renderer - The renderer instance
 * @param {string} framesDir - Directory to save rendered frames
 * @returns {Promise<void>}
 */
async function generateFrames(pose, renderer, framesDir) {
  mkdirSync(framesDir, { recursive: true });
  const data = [];
  const padLength = pose.body.frames.length.toString().length;
  console.log(`Rendering ${pose.body.frames.length} frames...`);
  let frame;
  for (let i = 0; i < pose.body.frames.length; i++) {
    frame = pose.body.frames[i];
    const img = renderer.render(frame);
    const buffer = img.toBuffer("image/png");
    const filename = `${framesDir}/frame_${String(i).padStart(
      padLength,
      "0"
    )}.png`;
    data.push([filename, buffer]);
    // writeFile(filename, buffer);
  }
  await Promise.all(
    data.map(([filename, buffer]) => writeFile(filename, buffer))
  );
}

/**
 * Helper: Use ffmpeg to create a video from rendered frames
 * @param {number} fps - Frames per second for the output video
 * @param {string} outputPath - Path to save the output video
 * @param {number} padLength - Number of digits to pad frame filenames
 * @param {string} framesDir - Directory containing rendered frames
 * @returns {Promise<void>} - Resolves when video is created
 */
async function combineFramesToVideo(fps, outputPath, padLength = 5, framesDir) {
  return new Promise((resolve, reject) => {
    console.log("Combining frames into video...", ffmpegPath);
    const ffmpeg = spawn(ffmpegPath || "ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-framerate",
      String(fps),
      "-i",
      `${framesDir}/frame_%0${padLength}d.png`,
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-crf",
      "25", // slightly lower quality for speed
      "-pix_fmt",
      "yuv420p",
      "-threads",
      "0",
      "-movflags",
      "+faststart",
      outputPath,
    ]);

    // ffmpeg.stdout.on("data", (d) => console.log(d.toString()));
    ffmpeg.stderr.on("data", (d) => console.error(d.toString()));
    ffmpeg.on("close", (code) => {
      console.log(`FFmpeg finished with code ${code}`);
      if (code !== 0) {
        console.error("❌ FFmpeg failed to create video");
        reject(new Error("FFmpeg failed"));
        return;
      }
      resolve();
    });
  });
}

/**
 * Core function shared by both poseToVideo and poseJsonToVideo
 * @param {Pose} pose - The pose object to process
 * @param {string} outputPath - Path to save the output video
 * @returns {Promise<boolean>} - Resolves to true if successful, false otherwise
 */
async function processPose(pose, outputPath) {
  console.log("Cleaning pose..");
  pose = cleanPoseJson(pose);

  if (!pose) {
    console.error("Pose file is invalid!");
    return false;
  }

  const framesDir = `frames/${randomBytes(4).toString("hex")}`;

  try {
    const fps = pose.body.fps;
    const renderer = new CanvasPoseRenderer({ width: 640, height: 480, pose });

    await generateFrames(pose, renderer, framesDir);
    await combineFramesToVideo(
      fps,
      outputPath,
      pose.body.frames.length.toString().length,
      framesDir
    );

    return true;
  } finally {
    rmSync(framesDir, { recursive: true, force: true });
  }
}

/**
 * Converts a .pose file into a video
 * @param {string} posePath - Path to the .pose file
 * @param {string} outputPath - Path to save the output video
 * @return {Promise<boolean>} - Resolves to true if successful, false otherwise
 */
async function poseToVideo(posePath, outputPath) {
  const pose = await Pose.fromLocal(posePath);
  return processPose(pose, outputPath);
}

/**
 * Converts a JSON pose object into a video
 * @param {Pose} pose - The pose JSON object
 * @param {string} outputPath - Path to save the output video
 * @return {Promise<boolean>} - Resolves to true if successful, false otherwise
 */
async function poseJsonToVideo(pose, outputPath) {
  return processPose(pose, outputPath);
}

if (require.main === module) {
  (async () => {
    rmSync("output.mp4", { force: true });
    console.time("Total time");
    await poseToVideo("./example.pose", "output.mp4");
    console.timeEnd("Total time");
  })();
}

module.exports = {
  poseToVideo,
  poseJsonToVideo,
};
