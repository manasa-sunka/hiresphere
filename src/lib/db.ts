import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Validate environment variables
if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
  throw new Error('Missing MySQL environment variables');
}

// SQL query function with parameterized queries
export async function sql<T>(query: string, values: unknown[] = []): Promise<T[]> {
  try {
    // Log query and values for debugging
    console.log('Executing MySQL query:', { query, values });
    const [rows] = await pool.execute(query, values.map(value => (value === undefined ? null : value)));
    return rows as T[];
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('MySQL query error:', {
        error: error.message,
        query,
        values,
        stack: error.stack,
      });
    } else {
      console.error('MySQL query error:', {
        error: 'Unknown error occurred',
        query,
        values,
      });
    }
    throw error;
  }
}