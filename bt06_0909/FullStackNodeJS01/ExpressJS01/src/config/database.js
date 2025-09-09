const mysql = require('mysql2/promise');
require('dotenv').config();

// Cấu hình kết nối database
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'utf8mb4'
};

// Tạo connection pool để tối ưu hiệu suất
const pool = mysql.createPool(dbConfig);

// Test kết nối database
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        console.log(`📊 Connected to database: ${dbConfig.database}`);
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Please check your database configuration in .env file');
        process.exit(1);
    }
};

// Utility function để thực hiện query
const query = async (sql, params = []) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Database Query Error:', error.message);
        throw error;
    }
};

// Utility function để thực hiện transaction
const transaction = async (callback) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const result = await callback(connection);
        
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Utility function để lấy một record
const findOne = async (table, conditions = {}, fields = '*') => {
    const conditionKeys = Object.keys(conditions);
    let sql = `SELECT ${fields} FROM ${table}`;
    
    if (conditionKeys.length > 0) {
        const whereClause = conditionKeys.map(key => `${key} = ?`).join(' AND ');
        sql += ` WHERE ${whereClause}`;
    }
    
    sql += ' LIMIT 1';
    
    const params = Object.values(conditions);
    const rows = await query(sql, params);
    return rows[0] || null;
};

// Utility function để lấy nhiều records
const findMany = async (table, conditions = {}, options = {}) => {
    const { 
        fields = '*', 
        orderBy = '', 
        limit = null, 
        offset = 0 
    } = options;
    
    const conditionKeys = Object.keys(conditions);
    let sql = `SELECT ${fields} FROM ${table}`;
    
    if (conditionKeys.length > 0) {
        const whereClause = conditionKeys.map(key => `${key} = ?`).join(' AND ');
        sql += ` WHERE ${whereClause}`;
    }
    
    if (orderBy) {
        sql += ` ORDER BY ${orderBy}`;
    }
    
    if (limit) {
        sql += ` LIMIT ${limit}`;
        if (offset > 0) {
            sql += ` OFFSET ${offset}`;
        }
    }
    
    const params = Object.values(conditions);
    return await query(sql, params);
};

// Utility function để tạo record mới
const create = async (table, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = await query(sql, values);
    
    return {
        insertId: result.insertId,
        affectedRows: result.affectedRows
    };
};

// Utility function để cập nhật record
const update = async (table, data, conditions) => {
    const dataKeys = Object.keys(data);
    const conditionKeys = Object.keys(conditions);
    
    const setClause = dataKeys.map(key => `${key} = ?`).join(', ');
    const whereClause = conditionKeys.map(key => `${key} = ?`).join(' AND ');
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const params = [...Object.values(data), ...Object.values(conditions)];
    
    const result = await query(sql, params);
    return result.affectedRows;
};

// Utility function để xóa record
const deleteRecord = async (table, conditions) => {
    const conditionKeys = Object.keys(conditions);
    const whereClause = conditionKeys.map(key => `${key} = ?`).join(' AND ');
    
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    const params = Object.values(conditions);
    
    const result = await query(sql, params);
    return result.affectedRows;
};

// Utility function để đếm records
const count = async (table, conditions = {}) => {
    const conditionKeys = Object.keys(conditions);
    let sql = `SELECT COUNT(*) as total FROM ${table}`;
    
    if (conditionKeys.length > 0) {
        const whereClause = conditionKeys.map(key => `${key} = ?`).join(' AND ');
        sql += ` WHERE ${whereClause}`;
    }
    
    const params = Object.values(conditions);
    const result = await query(sql, params);
    return result[0].total;
};

module.exports = {
    pool,
    testConnection,
    query,
    transaction,
    findOne,
    findMany,
    create,
    update,
    delete: deleteRecord,
    count
};
