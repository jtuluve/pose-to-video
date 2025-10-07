const { Pose } = require("./pose-format/index.js");
const { CanvasPoseRenderer } = require("./renderers/canvas.pose-renderer.js");
const { mkdirSync, writeFileSync, rmSync } = require("fs");
const { spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");

function generateFrames(pose, renderer) {
  rmSync("frames", { recursive: true, force: true });
  mkdirSync("frames");

  const { frames } = pose.body;
  console.log(`Rendering ${frames.length} frames...`);

  frames.forEach((frame, i) => {
    const image = renderer.render(frame);
    const buffer = image.toBuffer("image/png");
    const filename = `frames/frame_${String(i).padStart(5, "0")}.png`;
    writeFileSync(filename, buffer);
  });
}

function combineFramesToVideo(fps, outputPath) {
  console.log("Combining frames into video...", ffmpegPath);
  const ffmpeg = spawn(ffmpegPath || "ffmpeg", [
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
  ffmpeg.on("close", (code) => console.log(`FFmpeg finished with code ${code}`));
}

/**
 * Converts a .pose file to a video
 */
async function poseToVideo(posePath, outputPath) {
  const pose = await Pose.fromLocal(posePath);
  const fps = pose.body.fps;
  const renderer = new CanvasPoseRenderer({ width: 640, height: 480, pose });

  generateFrames(pose, renderer);
  combineFramesToVideo(fps, outputPath);

  return true;
}

async function poseJsonToVideo(pose, outputPath) {
  const fps = pose.body.fps;
  const renderer = new CanvasPoseRenderer({ width: 640, height: 480, pose });

  generateFrames(pose, renderer);
  combineFramesToVideo(fps, outputPath);

  return true;
}

if (require.main === module) poseToVideo("./example.pose", "output.mp4");

module.exports = {
  poseToVideo,
  poseJsonToVideo,
};
