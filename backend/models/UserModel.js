const CreateUpdateModel = require('./CreateUpdateModel');

class User {
    constructor(Database) {
        this.Database = Database;

        // Columns in the 'user' table
        this.columnsList = [
            'userid', 'first_name', 'last_name', 'phone', 'email',
            'address', 'username', 'password', 'status', 'date_time', 'sessionid'
        ];

        // Ensure the table is created
        this.createTable();
    }

    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: 'user',
            createTableStatement: `
                userid BIGINT(100) PRIMARY KEY,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                phone VARCHAR(50),
                email VARCHAR(255),
                address VARCHAR(255),
                username VARCHAR(50),
                password TEXT,
                status VARCHAR(50),
                date_time DATETIME,
                sessionid BIGINT(100)
            `,
            foreignKeyStatement: `
                ALTER TABLE user ADD FOREIGN KEY(sessionid) REFERENCES session(sessionid)
            `,
            alterTableStatement: []
        });

        return await CreateUpdateTable.checkTableExistence();
    }

    async insertTable(columns) {
        await this.createTable();
        try {
            const placeholders = this.columnsList.map(() => '?').join(',');
            const sql = `INSERT INTO user (${this.columnsList.join(',')}) VALUES (${placeholders})`;
            const result = await this.Database.setupConnection({ sql, columns }, 'object');
            return result;
        } catch (error) {
            console.error('Insert User Error:', error);
            return { error: true, message: error.message };
        }
    }

    async updateTable({ sql, columns }) {
        try {
            const fullSql = `UPDATE user SET ${sql}`;
            const result = await this.Database.setupConnection({ sql: fullSql, columns }, 'object');
            return result;
        } catch (error) {
            console.error('Update User Error:', error);
            return { error: true, message: error.message };
        }
    }

    async preparedFetch({ sql, columns }) {
        try {
            const fullSql = `SELECT * FROM user WHERE ${sql}`;
            const result = await this.Database.setupConnection({ sql: fullSql, columns }, 'object');
            return result;
        } catch (error) {
            console.error('Fetch User Error:', error);
            return { error: true, message: error.message };
        }
    }

    // Optional: Get a user by username
    async getUserByUsername(username) {
        return await this.preparedFetch({
            sql: 'username = ?',
            columns: [username]
        });
    }

    // Optional: Soft-delete user by setting status
    async deactivateUser(userid) {
        return await this.updateTable({
            sql: 'status = ? WHERE userid = ?',
            columns: ['inactive', userid]
        });
    }
}

module.exports = User;
