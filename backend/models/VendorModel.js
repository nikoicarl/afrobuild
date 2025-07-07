const CreateUpdateModel = require('./CreateUpdateModel');

class Vendor {
    constructor(Database) {
        this.Database = Database;

        // Columns in the 'vendor' table
        this.columnsList = [
            'vendorid', 'name',  'phone', 'email',
            'address', 'location', 'status', 'date_time', 'sessionid'
        ];

        // Ensure the table is created
        this.createTable();
    }

    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: 'vendor',
            createTableStatement: `
                vendorid BIGINT(100) PRIMARY KEY,
                name VARCHAR(255),
                phone VARCHAR(50),
                email VARCHAR(100),
                address VARCHAR(255),
                location VARCHAR(255),
                status VARCHAR(50),
                date_time DATETIME,
                sessionid BIGINT(100)
            `,
            foreignKeyStatement: `
                ALTER TABLE vendor ADD FOREIGN KEY(sessionid) REFERENCES session(sessionid)
            `,
            alterTableStatement: []
        });

        return await CreateUpdateTable.checkTableExistence();
    }

    async insertTable(columns) {
        await this.createTable();
        try {
            const placeholders = this.columnsList.map(() => '?').join(',');
            const sql = `INSERT IGNORE INTO vendor (${this.columnsList.join(',')}) VALUES (${placeholders})`;
            const result = await this.Database.setupConnection({ sql, columns }, 'object');
            return result;
        } catch (error) {
            console.error('Insert Vendor Error:', error);
            return { error: true, message: error.message };
        }
    }

    async updateTable({ sql, columns }) {
        try {
            const fullSql = `UPDATE vendor SET ${sql}`;
            const result = await this.Database.setupConnection({ sql: fullSql, columns }, 'object');
            return result;
        } catch (error) {
            console.error('Update Vendor Error:', error);
            return { error: true, message: error.message };
        }
    }

    async preparedFetch({ sql, columns }) {
        try {
            const fullSql = `SELECT * FROM vendor WHERE ${sql}`;
            const result = await this.Database.setupConnection({ sql: fullSql, columns }, 'object');
            return result;
        } catch (error) {
            console.error('Fetch Vendor Error:', error);
            return { error: true, message: error.message };
        }
    }

    // Optional: Get a vendor by name
    async getVendorByVendorname(name) {
        return await this.preparedFetch({
            sql: 'name = ?',
            columns: [name]
        });
    }

    // Optional: Soft-delete vendor by setting status
    async deactivateVendor(vendorid) {
        return await this.updateTable({
            sql: 'status = ? WHERE vendorid = ?',
            columns: ['inactive', vendorid]
        });
    }
}

module.exports = Vendor;
