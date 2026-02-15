import express from "express";
import Settings from "../models/Settings.js";

const router = express.Router();

// Get start date
router.get("/", async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    return res.json(null);
  }

  res.json(settings);
});

// Update or create start date
router.post("/", async (req, res) => {
  const { startDate } = req.body;

  let settings = await Settings.findOne();

  if (settings) {
    settings.startDate = startDate;
    await settings.save();
  } else {
    settings = new Settings({ startDate });
    await settings.save();
  }

  res.json(settings);
});

export default router;
