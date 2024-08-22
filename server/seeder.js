import { getPool } from './db.js';

export async function seedDatabase(truncate = true) {
    let connection;
    try {
        const pool = await getPool();
        connection = await pool.getConnection();

        // Clear existing data
        if (truncate) {
            await connection.query('DELETE FROM logged_time');
            await connection.query('DELETE FROM task_statuses');
            await connection.query('DELETE FROM tasks');
            await connection.query('DELETE FROM locations');
            await connection.query('DELETE FROM workers');
        }

        // Seed locations
        const location1 = await connection.query('INSERT INTO locations (name) VALUES (?)', ['Kitchen']);
        const location2 = await connection.query('INSERT INTO locations (name) VALUES (?)', ['Garage']);

        // Seed workers
        const worker1 = await connection.query('INSERT INTO workers (username, hourly_wage) VALUES (?, ?)', ['Michael Jordan', 20.00]);
        const worker2 = await connection.query('INSERT INTO workers (username, hourly_wage) VALUES (?, ?)', ['Drew Brees', 25.00]);

        // Seed tasks
        const task1 = await connection.query('INSERT INTO tasks (description, location_id) VALUES (?, ?)', ['Fix Sink', location1.insertId]);
        const task2 = await connection.query('INSERT INTO tasks (description, location_id) VALUES (?, ?)', ['Replace Lightbulb', location2.insertId]);

        // Seed task statuses
        await connection.query('INSERT INTO task_statuses (task_complete, task_id) VALUES (?, ?)', [true, 1]);
        await connection.query('INSERT INTO task_statuses (task_complete, task_id) VALUES (?, ?)', [false, 2]);

        // Seed logged time
        await connection.query('INSERT INTO logged_time (time_seconds, task_id, worker_id) VALUES (?, ?, ?)', [3600, task1.insertId, worker1.insertId]);
        await connection.query('INSERT INTO logged_time (time_seconds, task_id, worker_id) VALUES (?, ?, ?)', [7200, task2.insertId, worker2.insertId]);

        // Log more time for task 1, 30 minutes from worker 2
        await connection.query('INSERT INTO logged_time (time_seconds, task_id, worker_id) VALUES (?, ?, ?)', [1800, task1.insertId, worker2.insertId]);

        return { success: true, message: 'Database seeded successfully' };

    } catch (err) {
        console.error('Error seeding database:', err);
        return { success: false, message: 'Error seeding database', error: err };
    } finally {
        if (connection) connection.release();
    }
}