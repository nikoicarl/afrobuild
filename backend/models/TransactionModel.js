const CreateUpdateModel = require('./CreateUpdateModel');

class Transaction {
    constructor(Database) {
        this.Database = Database;

        this.tableName = 'transaction';
        this.columnsList = [
            'transactionid', 'userid', 'amount', 'message', 'datetime', 'status'
        ];

        this.createTable();
    }

    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: this.tableName,
            createTableStatement: `
                transactionid BIGINT(100) PRIMARY KEY,
                userid BIGINT(100),
                amount DECIMAL(10, 2),
                message TEXT,
                datetime DATETIME,
                status VARCHAR(50)
            `,
            foreignKeyStatement: '',
            alterTableStatement: ['message TEXT'],
        });

        return await CreateUpdateTable.checkTableExistence();
    }

    async insertTable(columns) {
        await this.createTable();
        try {
            const placeholders = this.columnsList.map(() => '?').join(',');
            const sql = `INSERT IGNORE INTO ${this.tableName} (${this.columnsList.join(',')}) VALUES (${placeholders})`;
            return await this.Database.setupConnection({ sql, columns }, 'object');
        } catch (error) {
            console.error('[Insert Transaction Error]:', error);
            return { error: true, message: error.message };
        }
    }

    async updateTable({ sql, columns }) {
        try {
            const query = `UPDATE ${this.tableName} SET ${sql}`;
            return await this.Database.setupConnection({ sql: query, columns }, 'object');
        } catch (error) {
            console.error('[UpdateTable Error]:', error);
            return { error: true, message: error.message };
        }
    }

    async preparedFetch({ sql, columns }) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE ${sql}`;
            return await this.Database.setupConnection({ sql: query, columns }, 'object');
        } catch (error) {
            console.error('[PreparedFetch Error]:', error);
            return { error: true, message: error.message };
        }
    }

    async getTotalAmount() {
        try {
            const sql = `SELECT SUM(amount) AS total FROM ${this.tableName}`;
            const [row] = await this.Database.setupConnection({ sql, columns: [] }, 'object');
            return row?.total || 0;
        } catch (error) {
            console.error('[getTotalAmount Error]:', error);
            return 0;
        }
    }

    async getDateRange() {
        try {
            const sql = `SELECT MIN(datetime) AS min, MAX(datetime) AS max FROM ${this.tableName}`;
            const [row] = await this.Database.setupConnection({ sql, columns: [] }, 'object');
            return row || {};
        } catch (error) {
            console.error('[getDateRange Error]:', error);
            return {};
        }
    }

    async getRecentTransactions(limit = 7) {
        try {
            const sql = `
                SELECT 
                    t.transactionid, 
                    CASE 
                        WHEN t.itemtype = 'product' THEN p.name
                        WHEN t.itemtype = 'service' THEN s.name
                        ELSE NULL
                    END AS product_service_name,
                    c.name AS category,
                    t.userid,
                    t.datetime AS date, 
                    u.name AS merchant_name,
                    t.amount, 
                    t.status
                FROM ${this.tableName} t
                LEFT JOIN product p ON p.id = t.product_service AND t.itemtype = 'product'
                LEFT JOIN service s ON s.id = t.product_service AND t.itemtype = 'service'
                LEFT JOIN category c ON c.id = t.category
                LEFT JOIN users u ON u.id = t.merchant
                ORDER BY t.datetime DESC
                LIMIT ?
            `;
            return await this.Database.setupConnection({ sql, columns: [limit] }, 'object');
        } catch (error) {
            console.error('[getRecentTransactions Error]:', error);
            return [];
        }
    }

    async count() {
        try {
            const sql = `SELECT COUNT(*) AS count FROM ${this.tableName}`;
            const [result] = await this.Database.setupConnection({ sql, columns: [] }, 'object');
            return result?.count || 0;
        } catch (error) {
            console.error('[Count Product Error]:', error);
            return 0;
        }
    }
}

module.exports = Transaction;
