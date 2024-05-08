import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getUsers,
} from "./database.js";
import { authenticateToken } from "./middlewere.js";

const router = express.Router();

router.post("/login", authenticateToken, async (req, res) => {
  const { name, password } = req.body;
  const users = await getUsers();
  const user = users.find((user) => user.name === name);
  if (!user) {
    return res.status(404).send("User not found");
  }

  try {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send("Invalid password");
    }
    // Generate JWT token
    const accessToken = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ accessToken });
  } catch (error) {
    console.error("Error generating access token:", error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/tasks", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await getTasks(userId);
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/create", authenticateToken, async (req, res) => {
  const { title, status } = req.body;
  const userId = req.user.id;
  try {
    const task = await createTask(userId, title, status);
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/update/:id", authenticateToken, async (req, res) => {
  const { title, status } = req.body;
  const taskId = req.params.id;
  const taskInfo = await getTask(taskId);
  if (req.user.id !== taskInfo.user_id) {
    return res.status(403).send("Forbidden");
  }
  try {
    const task = await updateTask(taskId, title, status);
    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/delete/:id", authenticateToken, async (req, res) => {
  const taskId = req.params.id;
  const taskInfo = await getTask(taskId);
  if (req.user.id !== taskInfo.user_id) {
    return res.status(403).send("Forbidden");
  }
  try {
    await deleteTask(taskId);
    const tasks = await getTasks(req.user.id);
    res.json(tasks);
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;