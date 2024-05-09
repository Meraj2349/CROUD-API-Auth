import express from "express";
import dotenv from "dotenv";
import router from "./operation.js";
import { createUser, getUsers } from "./database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./middlewere.js";

dotenv.config();
const app = express();
app.use(express.json());
console.log(getUsers());
app.post("/register", async (req, res) => {
  var hashedPassword = await bcrypt.hashSync(req.body.password, 10);
  const { name } = req.body;
  const user = { name: name };

  if (!name || !hashedPassword) {
    return res.status(400).send("Name, password, and role are required.");
  }
  try {
    await createUser(name, hashedPassword);
    const accesstoken = jwt.sign({ name }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    res.json({ accesstoken: accesstoken });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const users = await getUsers();
    const user = users.filter((user) => user.name === req.user.name);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/", router);

app.listen(3001, () => {
  console.log("Server is running at port 3001");
});