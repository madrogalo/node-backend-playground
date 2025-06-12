const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const router = express.Router();

const SECRET_KEY = process.env.SECRET_KEY;

router.get("/video", (req, res) => {
  const token = req.cookies.token;

  console.log("Token from cookies:", token);

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const videoPath = path.join(
    __dirname,
    "../assets/file_example_MP4_1280_10MG.mp4"
    //  "../assets/13234207-uhd_3840_2160_25fps.mp4"
  );
  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    });
    fs.createReadStream(videoPath).pipe(res);
    return;
  }

  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  const chunkSize = end - start + 1;
  const file = fs.createReadStream(videoPath, { start, end });

  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": "video/mp4",
  });

  file.pipe(res);
});

module.exports = router;
