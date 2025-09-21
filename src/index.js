const { Pose } = require("./pose-format/index.js");
const { CanvasPoseRenderer } = require("./renderers/canvas.pose-renderer.js");
const { existsSync, mkdirSync, writeFileSync } = require("fs");
const { spawn } = require("child_process");

/**
 *
 * @param {string} posePath
 * @param {string} outputPath
 */
async function poseToVideo(posePath, outputPath) {
  // 1. Load pose
  const pose = await Pose.fromLocal(posePath);
  const fps = pose.body.fps;
  const width = 640,
    height = 480;

  const renderer = new CanvasPoseRenderer({ width, height, pose });

  if (!existsSync("frames")) {
    mkdirSync("frames");
  }
  // 2. Generate frames
  console.log(`Rendering ${pose.body.frames.length} frames...`);
  for (let i = 0; i < pose.body.frames.length; i++) {
    let a = renderer.render(pose.body.frames[i]);

    const buffer = a.toBuffer("image/png");
    writeFileSync(`frames/frame_${String(i).padStart(5, "0")}.png`, buffer);
  }

  // 3. Call ffmpeg to stitch frames
  console.log("Combining frames into video...");
  const ffmpeg = spawn("ffmpeg", [
    "-framerate",
    String(fps),
    "-i",
    "frames/frame_%05d.png",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    outputPath,
  ]);

  ffmpeg.stdout.on("data", (d) => console.log(d.toString()));
  ffmpeg.stderr.on("data", (d) => console.error(d.toString()));
  ffmpeg.on("close", (code) => {
    console.log(`FFmpeg finished with code ${code}`);
  });
}

if (require.main === module) poseToVideo("./example.pose", "output.mp4");

module.exports = {
  poseToVideo,
};
