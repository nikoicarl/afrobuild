const CreateUpdateModel = require('./CreateUpdateModel');

class Setup {
    constructor(Database) {
        this.Database = Database;
        this.columnsList = [
            'setupid', 'name', 'email', 'phone', 'address',
            'country', 'state_region', 'status', 'date_time', 'sessionid'
        ];
    }

    // Insert method
    async insertTable(columns) {
        try {
            const tableExists = await this.createTable();
            if (!tableExists) throw new Error('Table creation failed.');

            const sql = `
                INSERT INTO setup (${this.columnsList.join(',')})
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `;

            const result = await this.Database.setupConnection({ sql, columns }, 'object');
            return result;
        } catch (error) {
            console.error('Insert error:', error);
            return error;
        }
    }

    // Update method
    async updateTable(object) {
        try {
            const sql = `UPDATE setup SET ${object.sql} WHERE setupid = ?`;
            const result = await this.Database.setupConnection({ sql, columns: object.columns }, 'object');
            return result;
        } catch (error) {
            console.error('Update error:', error);
            return error;
        }
    }

    // Fetch method
    async preparedFetch(object) {
        try {
            const sql = `SELECT * FROM setup WHERE ${object.sql}`;
            const result = await this.Database.setupConnection({ sql, columns: object.columns }, 'object');
            return result;
        } catch (error) {
            console.error('Fetch error:', error);
            return error;
        }
    }

    // Find one record
    async findOne(condition) {
        try {
            const sql = `SELECT * FROM setup WHERE ${condition.sql} LIMIT 1`;
            const result = await this.Database.setupConnection({ sql, columns: condition.columns }, 'object');
            return result[0] || null;
        } catch (error) {
            console.error('FindOne error:', error);
            return error;
        }
    }

    // Check if table exists and create if not
    async createTable() {
        try {
            const CreateUpdateTable = new CreateUpdateModel(this.Database, {
                tableName: 'setup',
                createTableStatement: `
                    setupid BIGINT(100) PRIMARY KEY,
                    name VARCHAR(255),
                    email VARCHAR(255),
                    phone VARCHAR(255),
                    address VARCHAR(255),
                    country VARCHAR(255),
                    state_region VARCHAR(255),
                    status ENUM('active', 'inactive') DEFAULT 'active',
                    date_time DATETIME,
                    sessionid BIGINT(100)
                `,
                foreignKeyStatement: ``,
                alterTableStatement: ['']
            });

            const exists = await CreateUpdateTable.checkTableExistence();

            if (!exists || exists.count === 0) {
                await CreateUpdateTable.createTableIfNotExist(); // You must define this method
            }

            return true;
        } catch (error) {
            console.error('CreateTable error:', error);
            return false;
        }
    }

    // Check if a business exists by setupid or email
    async checkBusinessExists(identifier, value) {
        try {
            if (!['setupid', 'email'].includes(identifier)) {
                throw new Error('Invalid identifier. Use "setupid" or "email".');
            }

            const sql = `SELECT COUNT(*) AS count FROM setup WHERE ${identifier} = ?`;
            const result = await this.Database.setupConnection({ sql, columns: [value] }, 'object');
            return result[0].count > 0;
        } catch (error) {
            console.error('CheckBusinessExists error:', error);
            return error;
        }
    }
}

module.exports = Setup;
