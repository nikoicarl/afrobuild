const CreateUpdateModel = require('./CreateUpdateModel');

class Product {
    constructor(Database) {
        this.Database = Database;

        // Define table and columns
        this.tableName = 'product';
        this.columnsList = [
            'productid', 'name', 'description', 
            'price', 'categoryid', 'userid', 'documents', 'datetime', 'status'
        ];

        // Ensure table exists on instantiation
        this.createTable();
    }

    // Create table if it doesn't exist
    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: this.tableName,
            createTableStatement: `
                productid BIGINT(100) PRIMARY KEY,
                name VARCHAR(255),
                description VARCHAR(255),
                price DOUBLE(10,2),
                categoryid BIGINT(100),
                userid BIGINT(100),
                documents LONGTEXT,
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
            const sql = `INSERT INTO product (${this.columnsList.join(',')}) VALUES (${placeholders})`;
            const result = await this.Database.setupConnection({ sql, columns }, 'object');
            return result;
        } catch (error) {
            console.error('Insert Product Error:', error);
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

module.exports = Product;
