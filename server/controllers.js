export async function getTasks() {

}

export async function getAllWorkers(db) {
    let connection;
    try {
        connection = await db.getConnection();
        const rows = await connection.query('SELECT * FROM workers');
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (connection) connection.release();
    }
}

export async function getWorkersCosts(db, workerId, locationId, completionStatus) {
    let connection;
    try {
        connection = await db.getConnection();
        // Base query
        let query = `
            SELECT 
                w.id as worker_id, 
                w.username, 
                ROUND(SUM(lt.time_seconds / 3600 * w.hourly_wage), 2) as total_cost
            FROM 
                workers w
            JOIN 
                logged_time lt ON lt.worker_id = w.id
            JOIN 
                tasks t ON lt.task_id = t.id
            JOIN 
                task_statuses ts ON ts.task_id = t.id
            JOIN
                locations l ON t.location_id = l.id
            WHERE 1=1
        `;

        // Adding optional filters
        const params = [];
        if (workerId) {
            query += ' AND w.id = ?';
            params.push(workerId);
        }
        if (locationId) {
            query += ' AND l.id = ?';
            params.push(locationId);
        }
        if (completionStatus) {
            query += ' AND ts.task_complete = ?';
            params.push(completionStatus);
        }

        query += ' GROUP BY w.id';

        const rows = await connection.query(query, params);
        return rows;

    } catch (err) {
        throw err;
    } finally {
        if (connection) connection.release();
    }
}

export async function getAllLocations(db) {
    let connection;
    try {
        connection = await db.getConnection();
        const rows = await connection.query('SELECT * FROM locations');
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (connection) connection.release();
    }
}

export async function getAllTasks(db) {
    let connection;
    try {
        connection = await db.getConnection();

        let query = `SELECT
                        t.id, t.description, t.location_id, ts.task_complete
                    FROM 
                        tasks t
                    JOIN 
                        task_statuses ts ON ts.task_id = t.id`;
    
        const rows = await connection.query(query);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (connection) connection.release();
    }
}

export async function getLoggedTime(db, workerId, taskId) {
    let connection;
    try {
        connection = await db.getConnection();
        let query = 'SELECT * FROM logged_time WHERE 1=1';
        if (workerId) {
            query += ' AND worker_id = ?';
        }
        if (taskId) {
            query += ' AND task_id = ?';
        }

        const rows = await connection.query(query, [workerId, taskId]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (connection) connection.release();
    }

}

export async function getLocationsCosts(db, workerId, locationId, completionStatus) {
    let connection;
    try {
        connection = await db.getConnection();

        // Base query
        let query = `
            SELECT 
                l.id, l.name, ROUND(SUM(lt.time_seconds / 3600 * w.hourly_wage), 2) as total_cost
            FROM 
                locations l
            JOIN 
                tasks t ON t.location_id = l.id
            JOIN 
                logged_time lt ON lt.task_id = t.id
            JOIN 
                workers w ON lt.worker_id = w.id
            JOIN 
                task_statuses ts ON ts.id = t.id
            WHERE 1=1
        `;

        // Adding optional filters
        const params = [];
        if (workerId) {
            query += ' AND w.id = ?';
            params.push(workerId);
        }
        if (locationId) {
            query += ' AND l.id = ?';
            params.push(locationId);
        }
        if (completionStatus) {
            query += ' AND ts.task_complete = ?';
            params.push(completionStatus);
        }

        query += ' GROUP BY l.id';

        const rows = await connection.query(query, params);
        return rows;

    } catch (err) {
        throw err;
    } finally {
        if (connection) connection.release();
    }
}

// POST endpoints
export async function createWorker(db, username, hourlyWage) {
    let connection;
    try {
        connection = await db.getConnection();
        const result = await connection.query('INSERT INTO workers (username, hourly_wage) VALUES (?, ?)', [username, hourlyWage]);
        return result.insertId.toString();
    } catch (err) {
        throw err;
    } finally {
        if (connection) connection.release();
    }
}

export async function createLocation(db, locationName) {
    let connection;
    try {
        connection = await db.getConnection();
        const result = await connection.query('INSERT INTO locations (name) VALUES (?)', [locationName]);
        return result.insertId.toString();
    } catch (err) {
        throw err;
    } finally {
        if (connection) connection.release();
    }
}

export async function createTask(db, locationId, description) {
    let connection;
    try {
        connection = await db.getConnection();
        const result = await connection.query('INSERT INTO tasks (description, location_id) VALUES (?, ?)', [description, locationId]);
        return result.insertId.toString();
    } catch (err) {
        throw err;
    } finally {
        if (connection) connection.release();
    }
}

export async function logTime(db, taskId, workerId, timeSeconds) {
    let connection;
    try {
        connection = await db.getConnection();
        const result = await connection.query('INSERT INTO logged_time (time_seconds, task_id, worker_id) VALUES (?, ?, ?)', [timeSeconds, taskId, workerId]);
        return result.insertId.toString();
    } catch (err) {
        throw err;
    } finally {
        if (connection) connection.release();
    }
}
