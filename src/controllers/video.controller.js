// video.controller.js
//
// TASK 2 — Implement the CRUD handlers (createVideo, getVideo, deleteVideo).
// TASK 3 — Implement the aggregation handler (topVideos).
//
// Copy the pattern from channel.controller.js EXACTLY:
//   async/await + try/catch  ->  ONE Mongoose op  ->  send response.
//   On any throw, call next(err). Never format errors here.

import mongoose from "mongoose";
import { Video } from "../models/video.model.js";

// ---- TASK 2: CRUD ----------------------------------------------------------

// CREATE  ->  201 with the created video
export async function createVideo(req, res, next) {
  try {
    const video = await Video.create(req.body);
    res.status(201).json(video);
  } catch (err) {
    next(err);
  }
}

// READ ONE  ->  200 with the video, or 404 if not found
export async function getVideo(req, res, next) {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.json(video);
  } catch (err) {
    next(err);
  }
}

// DELETE  ->  204 no content, or 404 if not found
export async function deleteVideo(req, res, next) {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ---- TASK 3: AGGREGATION ---------------------------------------------------
// GET /channels/:id/top-videos  ->  the channel's top 10 videos by views.
//
// Pipeline:
//   $match   only this channel's videos   (cast req.params.id to an ObjectId yourself!)
//   $sort    views descending
//   $limit   10
//   $project title, views (and _id)
//
// Respond with: { channelId: req.params.id, count: videos.length, videos }
export async function topVideos(req, res, next) {
  try {
    const channelId = new mongoose.Types.ObjectId(req.params.id);
    const videos = await Video.aggregate([
      { $match: { channelId } },
      { $sort: { views: -1 } },
      { $limit: 10 },
      { $project: { title: 1, views: 1, _id: 1 } },
    ]);
    res.json({ channelId: req.params.id, count: videos.length, videos });
  } catch (err) {
    next(err);
  }
}
