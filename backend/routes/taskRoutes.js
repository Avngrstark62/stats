import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

// Get all tasks
router.get("/", async (req, res) => {
  const tasks = await Task.find().sort({ date: -1 });
  res.json(tasks);
});

// Create task
router.post("/", async (req, res) => {
  const { date, title } = req.body;
  const task = new Task({ date, title });
  await task.save();
  res.json(task);
});

// Toggle completion
router.patch("/:id", async (req, res) => {
  const task = await Task.findById(req.params.id);
  task.completed = !task.completed;
  await task.save();
  res.json(task);
});

// Delete task
router.delete("/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
