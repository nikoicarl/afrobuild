const CreateUpdateModel = require('./CreateUpdateModel');

class Category {
    constructor(Database) {
        this.Database = Database;
        this.tableName = 'category';
        this.columnsList = ['categoryid', 'name', 'description', 'datetime', 'status'];

        // Create table if it doesn't exist
        this.createTable();
    }

    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: this.tableName,
            createTableStatement: `
                categoryid BIGINT(100) PRIMARY KEY,
                name VARCHAR(255),
                description VARCHAR(255),
                datetime DATETIME,
                status VARCHAR(50)
            `,
            foreignKeyStatement: '',
            alterTableStatement: []
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
            console.error('[Insert Category Error]:', error);
            return { error: true, message: error.message };
        }
    }

    async updateTable({ sql, columns }) {
        try {
            const query = `UPDATE ${this.tableName} SET ${sql}`;
            return await this.Database.setupConnection({ sql: query, columns }, 'object');
        } catch (error) {
            console.error('[Update Category Error]:', error);
            return { error: true, message: error.message };
        }
    }

    async preparedFetch({ sql, columns }) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE ${sql}`;
            return await this.Database.setupConnection({ sql: query, columns }, 'object');
        } catch (error) {
            console.error('[Fetch Category Error]:', error);
            return { error: true, message: error.message };
        }
    }

    async count() {
        try {
            const sql = `SELECT COUNT(*) AS count FROM ${this.tableName}`;
            const [result] = await this.Database.setupConnection({ sql, columns: [] }, 'object');
            return result?.count || 0;
        } catch (error) {
            console.error('[Count Category Error]:', error);
            return 0;
        }
    }
}

module.exports = Category;
