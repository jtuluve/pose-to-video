# Pose to Video

A library to convert pose file to a video.

## Installation

```bash
npm install pose-to-video
```

## Usage

```javascript
const { poseToVideo } = require('pose-to-video');

poseToVideo('path/to/your/pose/file.pose', 'path/to/output/video.mp4')
  .then(() => console.log('Video created successfully!'))
  .catch(err => console.error(err));
```

## Dependencies

*   [binary-parser](https://www.npmjs.com/package/binary-parser): For parsing the binary pose file.
*   [canvas](https://www.npmjs.com/package/canvas): For rendering the pose frames.
*   [ffmpeg](https://ffmpeg.org/): Required for stitching the frames into a video. Make sure you have `ffmpeg` installed and available in your system's PATH.
*   [pose-format](https://www.npmjs.com/package/pose-format): For parsing the pose file.
*   [pose-viewer](https://www.npmjs.com/package/pose-viewer): For rendering the pose frames. 

The pose-format and pose-viewer library is included in the src. Since I needed to modify the src code of these library, I copied them into my repo. The credit goes to the original authors.

## How it works

1.  **Parse Pose File:** The library reads the `.pose` file and parses the header and body information.
2.  **Render Frames:** For each frame in the pose data, it uses a renderer (currently a `canvas` renderer) to draw the pose on a canvas.
3.  **Stitch Frames:** The rendered frames are then stitched together into a video using `ffmpeg`.
