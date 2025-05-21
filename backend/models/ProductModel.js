const CreateUpdateModel = require('./CreateUpdateModel');

class Product {
    constructor(Database) {
        this.Database = Database;

        // Define table and columns
        this.tableName = 'product';
        this.columnsList = [
            'productid', 'name', 'description', 
            'price', 'documents', 'datetime', 'status'
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
    async insertTable (columns) {
        let result = await this.createTable();
        try {
            if (result) {
                let sql = `
                    INSERT IGNORE INTO product (${this.columnsList.toString()}) VALUES (?,?,?,?,?, ?,?);
                `;
                result = await this.Database.setupConnection({sql: sql, columns: columns}, 'object');
                return result;
            } else {
                return result;
            }
        } catch (error) {
            return error;
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

module.exports = Product;
