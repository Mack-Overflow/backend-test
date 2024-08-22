import express from "express";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { seedDatabase } from "./seeder.js";

const app = express();
const port = 3000;
// let db;

// async function connect() {
//   console.info("Connecting to DB...");
//   db = mariadb.createPool({
//     host: process.env["DATABASE_HOST"],
//     user: process.env["DATABASE_USER"],
//     password: process.env["DATABASE_PASSWORD"],
//     database: process.env["DATABASE_NAME"]
//   });

//   const conn = await db.getConnection();
//   try {
//     await conn.query("SELECT 1");
//   } finally {
//     await conn.end();
//   }
// }


import { getAllWorkers, getAllLocations, getLocationsCosts, getWorkersCosts, getAllTasks, getLoggedTime } from "./controllers.js";
import { createWorker, createLocation, createTask, logTime } from "./controllers.js";
import { getPool } from "./db.js";

async function main() {
  // await connect();
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("Hello!");
  });

  let db = await getPool();

  app.get("/workers", async (req, res) => {
    try {
      const workers = await getAllWorkers(db);
      res.json(workers);
    } catch (err) {
      logErr(err);
      res.status(500).json({ error: "Failed to retrieve workers" });
    }
  });

  app.get("/costs/workers", async(req, res) => {
    const { worker_id, location_id, task_complete } = req.query;

    try {
      const workers = await getWorkersCosts(db, worker_id, location_id, task_complete);
      res.json(workers);
    } catch (err) {
      logErr(err);
      res.status(500).json({ error: "Failed to retrieve workers"});
    }
  });

  app.get("/locations", async (req, res) => {
    try {
      const locations = await getAllLocations(db);
      res.json(locations);
    } catch (err) {
      logErr(err);
      res.status(500).json({ error: "Failed to retrieve locations" });
    }
  });

  app.post("/locations", async (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const result = await createLocation(db, name);
      res.json(result);
    } catch (err) {
      logErr(err);
      res.status(500).json({ error: "Failed to create location" });
    }
  });

  // Endpoint to get locations with total cost
  app.get('/costs/locations/', async (req, res) => {
    const { worker_id, location_id, task_complete } = req.query;

    try {
        const locations = await getLocationsCosts(db, worker_id, location_id, task_complete);
        res.json(locations);
    } catch (err) {
        // console.error(err);
        logErr(err);
        res.status(500).json({ error: 'Failed to retrieve locations' });
    }
  });

  app.get('/tasks', async (req, res) => {
    try {
      const tasks = await getAllTasks(db);
      res.json(tasks);
    } catch (err) {
      logErr(err);
      res.status(500).json({ error: "Failed to retrieve tasks" });
    }
  })

  app.post('/tasks', async (req, res) => {
    const { description, location_id } = req.body;

    if (!description || !location_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const result = await createTask(db, location_id, description);
      res.json(result);
    } catch (err) {
      logErr(err);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.post('/tasks/:task_id/log-time', async (req, res) => {
    const { worker_id, time_seconds } = req.body;
    const { task_id } = req.params;

    if (!worker_id || !time_seconds) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const result = await logTime(db, task_id, worker_id, time_seconds);
      res.json(result);
    } catch (err) {
      logErr(err);
      res.status(500).json({ error: "Failed to log time" });
    }
  });

  app.put('/tasks/:task_id/status', async (req, res) => {
    const { task_complete } = req.body;
    const { task_id } = req.params;

    if (task_complete === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const connection = await db.getConnection();
      const result = await connection.query('UPDATE task_statuses SET task_complete = ? WHERE task_id = ?', [task_complete, task_id]);
      connection.release();

      res.json({ message: "Task status updated for task "+task_id });
    } catch (err) {
      logErr(err);
      res.status(500).json({ error: "Failed to update task status" });
    }
  });

  app.get('/tasks/logged-time', async (req, res) => {
    try {
      const loggedTime = await getLoggedTime(db);
      res.json(loggedTime);
    } catch (err) {
      logErr(err);
      res.status(500).json({ error: "Failed to retrieve logged time" });
    }
  });

  app.post('/workers', async (req, res) => {
    const { username, hourly_wage } = req.body;

    if (!username || !hourly_wage) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const result = await createWorker(db, username, hourly_wage);
      res.json(result);
    } catch (err) {
      logErr(err);
      res.status(500).json({ error: "Failed to create worker" });
    }
  });
  

  // Endpoint to seed the database - for development environment only
  app.get('/seed', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ error: 'Forbidden. App env: ' + process.env.NODE_ENV });
    }

    try {
      const result = await seedDatabase();
      res.json(result);
    } catch (err) {
        logErr(err);
        res.status(500).json({ error: 'Failed to seed database' });
    }
  });

  app.listen(port, "0.0.0.0", () => {
    console.info(`App listening on ${port}.`);
  });
}

function logErr(err) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const logFilePath = path.join(__dirname, "error.log");
  const logMessage = `${new Date().toISOString()} - ${err.message}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Failed to log error to file:", err);
    }
  });
}

await main();
