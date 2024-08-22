import mariadb from "mariadb";

export async function getPool() {
    let db = mariadb.createPool({
        host: process.env["DATABASE_HOST"],
        user: process.env["DATABASE_USER"],
        password: process.env["DATABASE_PASSWORD"],
        database: process.env["DATABASE_NAME"]
    });

    return db;
}

// module.exports = {
//     getPool
// };