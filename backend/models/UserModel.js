const CreateUpdateModel = require('./CreateUpdateModel');

class User {
    constructor(Database) {
        this.Database = Database;
        this.tableName = 'user';

        this.columnsList = [
            'userid', 'first_name', 'last_name', 'phone', 'email',
            'address', 'username', 'password', 'user_role', 'status', 'date_time', 'sessionid'
        ];

        this.createTable();
    }

    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: this.tableName,
            createTableStatement: `
                userid BIGINT(100) PRIMARY KEY,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                phone VARCHAR(50),
                email VARCHAR(255),
                address VARCHAR(255),
                username VARCHAR(50),
                password TEXT,
                user_role BIGINT(100),
                status VARCHAR(50),
                date_time DATETIME,
                sessionid BIGINT(100)
            `,
            foreignKeyStatement: `
                FOREIGN KEY (sessionid) REFERENCES session(sessionid)
            `,
            alterTableStatement: []
        });

        return await CreateUpdateTable.checkTableExistence();
    }

    async insertTable(columns) {
        await this.createTable();
        try {
            const placeholders = this.columnsList.map(() => '?').join(',');
            const sql = `INSERT INTO ${this.tableName} (${this.columnsList.join(',')}) VALUES (${placeholders})`;
            return await this.Database.setupConnection({ sql, columns }, 'object');
        } catch (error) {
            console.error('[Insert User Error]:', error);
            return { error: true, message: error.message };
        }
    }

    async updateTable({ sql, columns }) {
        try {
            const query = `UPDATE ${this.tableName} SET ${sql}`;
            return await this.Database.setupConnection({ sql: query, columns }, 'object');
        } catch (error) {
            console.error('[Update User Error]:', error);
            return { error: true, message: error.message };
        }
    }

    async preparedFetch({ sql, columns }) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE ${sql}`;
            return await this.Database.setupConnection({ sql: query, columns }, 'object');
        } catch (error) {
            console.error('[Fetch User Error]:', error);
            return { error: true, message: error.message };
        }
    }

    async getUserByUsername(username) {
        return await this.preparedFetch({
            sql: 'username = ?',
            columns: [username]
        });
    }

    async joinFetch(object) {
        
        try {
            if (!object?.sql || !Array.isArray(object.columns)) {
                throw new Error('Invalid parameters for joinFetch');
            }

            const sql = `
            SELECT
                t1.*,
                COALESCE(t2.name, 'No Role Assigned') AS role_name
            FROM user AS t1
            LEFT JOIN role AS t2
                ON t2.roleid = t1.user_role
            WHERE ${object.sql}
        `;

            const result = await this.Database.setupConnection({
                sql,
                columns: object.columns
            }, 'object');

            return result;
        } catch (error) {
            console.error('joinFetch error:', error);
            return { error: error.message || 'An unexpected error occurred in joinFetch.' };
        }
    }


    async deactivateUser(userid) {
        return await this.updateTable({
            sql: 'status = ? WHERE userid = ?',
            columns: ['inactive', userid]
        });
    }
}

module.exports = User;
