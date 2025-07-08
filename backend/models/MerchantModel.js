const CreateUpdateModel = require('./CreateUpdateModel');

class Merchant {
    constructor(Database) {
        this.Database = Database;

        // Columns in the 'merchant' table
        this.columnsList = [
            'merchantid', 'name',  'phone', 'email',
            'address', 'location', 'status', 'date_time', 'sessionid'
        ];

        // Ensure the table is created
        this.createTable();
    }

    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: 'merchant',
            createTableStatement: `
                merchantid BIGINT(100) PRIMARY KEY,
                name VARCHAR(255) UNIQUE,
                phone VARCHAR(50),
                email VARCHAR(100),
                address VARCHAR(255),
                location VARCHAR(255),
                status VARCHAR(50),
                date_time DATETIME,
                sessionid BIGINT(100)
            `,
            foreignKeyStatement: `
                ALTER TABLE merchant ADD FOREIGN KEY(sessionid) REFERENCES session(sessionid)
            `,
            alterTableStatement: []
        });

        return await CreateUpdateTable.checkTableExistence();
    }

    async insertTable(columns) {
        await this.createTable();
        try {
            const placeholders = this.columnsList.map(() => '?').join(',');
            const sql = `INSERT IGNORE INTO merchant (${this.columnsList.join(',')}) VALUES (${placeholders})`;
            const result = await this.Database.setupConnection({ sql, columns }, 'object');
            return result;
        } catch (error) {
            console.error('Insert Merchant Error:', error);
            return { error: true, message: error.message };
        }
    }

    async updateTable({ sql, columns }) {
        try {
            const fullSql = `UPDATE merchant SET ${sql}`;
            const result = await this.Database.setupConnection({ sql: fullSql, columns }, 'object');
            return result;
        } catch (error) {
            console.error('Update Merchant Error:', error);
            return { error: true, message: error.message };
        }
    }

    async preparedFetch({ sql, columns }) {
        try {
            const fullSql = `SELECT * FROM merchant WHERE ${sql}`;
            const result = await this.Database.setupConnection({ sql: fullSql, columns }, 'object');
            return result;
        } catch (error) {
            console.error('Fetch Merchant Error:', error);
            return { error: true, message: error.message };
        }
    }

    // Optional: Get a merchant by merchantname
    async getMerchantByMerchantname(merchantname) {
        return await this.preparedFetch({
            sql: 'merchantname = ?',
            columns: [merchantname]
        });
    }

    // Optional: Soft-delete merchant by setting status
    async deactivateMerchant(merchantid) {
        return await this.updateTable({
            sql: 'status = ? WHERE merchantid = ?',
            columns: ['inactive', merchantid]
        });
    }
}

module.exports = Merchant;
