const CreateUpdateModel = require('./CreateUpdateModel');

class Transaction {
    constructor(Database) {
        this.Database = Database;

        // Define table and columns
        this.tableName = 'transaction';
        this.columnsList = [
            'transactionid', 'product_service', 'category', 'userid', 
            , 'merchant', 'amount', 'datetime', 'status'
        ];

        // Ensure table exists on instantiation
        this.createTable();
    }

    // Create table if it doesn't exist
    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: this.tableName,
            createTableStatement: `
                transactionid BIGINT(100) PRIMARY KEY,
                product_service BIGINT(100),
                category BIGINT(100),
                userid BIGINT(100),
                merchant BIGINT(100),
                amount DECIMAL(10, 2),
                datetime DATETIME,
                status VARCHAR(50)
            `,
            foreignKeyStatement: '',
            alterTableStatement: []
        });

        return await CreateUpdateTable.checkTableExistence();
    }

    //Insert method
    async insertTable(columns) {
        await this.createTable();
        try {
            const placeholders = this.columnsList.map(() => '?').join(',');
            const sql = `INSERT INTO transaction (${this.columnsList.join(',')}) VALUES (${placeholders})`;
            const result = await this.Database.setupConnection({ sql, columns }, 'object');
            return result;
        } catch (error) {
            console.error('Insert Transaction Error:', error);
            return { error: true, message: error.message };
        }
    }

    // Update existing record(s)
    async updateTable({ sql, columns }) {
        try {
            const query = `UPDATE ${this.tableName} SET ${sql}`;
            return await this.Database.setupConnection({ sql: query, columns }, 'object');
        } catch (error) {
            console.error('[updateTable Error]:', error);
            return error;
        }
    }

    // Fetch with custom WHERE condition
    async preparedFetch({ sql, columns }) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE ${sql}`;
            return await this.Database.setupConnection({ sql: query, columns }, 'object');
        } catch (error) {
            console.error('[preparedFetch Error]:', error);
            return error;
        }
    }
}

module.exports = Transaction;
