const CreateUpdateModel = require('../../app/CreateUpdateModel');

// Initialize Setup Class
class Setup {

    constructor(Database) {
        this.Database = Database;
        this.columnsList = [
            'setupid', 'name', 'email', 'phone', 'address', 'country', 
            'state_region', 'city', 'zipcode', 'logo', 'primary_color', 
            'status', 'date_time', 'sessionid'
        ];
        this.createTable();
    }

    // Insert method
    async insertTable(columns) {
        let result = await this.createTable();
        try {
            if (result) {
                let sql = `INSERT INTO setup (${this.columnsList.toString()}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
                result = await this.Database.setupConnection({ sql: sql, columns: columns }, 'object');
                return result;
            } else {
                return result;
            }
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    // Update method
    async updateTable(object) {
        try {
            let sql = `UPDATE setup SET ${object.sql} WHERE setupid = ?`;
            let result = await this.Database.setupConnection({ sql: sql, columns: object.columns }, 'object');
            return result;
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    // Fetch method with prepared statement
    async preparedFetch(object) {
        try {
            let sql = `SELECT * FROM setup WHERE ${object.sql}`;
            let result = await this.Database.setupConnection({ sql: sql, columns: object.columns }, 'object');
            return result;
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    // New method to find a single record (findOne)
    async findOne(condition) {
        try {
            let sql = `SELECT * FROM setup WHERE ${condition.sql} LIMIT 1`;
            let result = await this.Database.setupConnection({ sql: sql, columns: condition.columns }, 'object');
            return result[0] || null; // Return the first record or null if no record is found
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    // Create table method
    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: 'setup',
            createTableStatement: `
                setupid BIGINT(100) PRIMARY KEY,
                name varchar(255),
                email varchar(255),
                phone varchar(50),
                address varchar(255),
                country varchar(50),
                state_region varchar(50),
                city varchar(50),
                zipcode varchar(50),
                logo varchar(255),
                primary_color varchar(50),
                status varchar(50),
                date_time varchar(50),
                sessionid varchar(50)
            `,
            foreignKeyStatement: '',
            alterTableStatement: ['']
        });
        let result = await CreateUpdateTable.checkTableExistence();
        return result;
    }

    // Check if a business exists by email or setupid
    async checkBusinessExists(identifier, value) {
        try {
            let sql = `SELECT COUNT(*) AS count FROM setup WHERE ${identifier} = ?`;
            let result = await this.Database.setupConnection({ sql: sql, columns: [value] }, 'object');
            return result[0].count > 0;
        } catch (error) {
            console.error(error);
            return error;
        }
    }
}

module.exports = Setup;
