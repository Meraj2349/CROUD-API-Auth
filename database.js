import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE
}).promise();
export async function getTasks(id) {
    const [rows] = await pool.query('SELECT id, title, status FROM tasks WHERE user_id = ?', [id]);
    return rows;
}
export async function getTask(id) {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    return rows[0];
}
export async function updateTask(id, title, status) {
    if (!title && !status) {
      throw new Error("Either title or status must be provided for update");
    }
     try {
       if (!title) {
         await pool.query("UPDATE tasks SET status = ? WHERE id = ?", [
           status,
           id,
         ]);
       } else if (!status) {
         await pool.query("UPDATE tasks SET title = ? WHERE id = ?", [
           title,
           id,
         ]);
       } else {
         await pool.query(
           "UPDATE tasks SET title = ?, status = ? WHERE id = ?",
           [title, status, id]
         );
       }

       return getTask(id);
     } catch (error) {
       console.error("Error updating task:", error);
       throw new Error("Error updating task");
     }
}
export async function createTask(userID, title, status) {
    const [result] = await pool.query('INSERT INTO tasks (user_id, title, status) VALUES(?, ?, ?)', [userID, title, status]);
    return getTask(result.insertId);
}
export async function getUsers() {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows;
}

export async function createUser(username, password) {
  try {
    const [result] = await pool.query(
      "INSERT INTO users (name, password) VALUES(?, ?)",
      [username, password]
    );
    console.log("User created successfully");
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}
export async function deleteTask(id) {
  try {
    // Execute SQL DELETE statement to remove task from database
    await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
  } catch (error) {
    // If an error occurs during the database operation, log the error and re-throw it
    console.error("Error deleting task:", error);
    throw error;
  }
}