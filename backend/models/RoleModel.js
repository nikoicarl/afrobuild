const CreateUpdateModel = require('./CreateUpdateModel');

//Intialize Class
class Role {

    //Constructor 
    constructor (Database) {
        this.Database = Database;

        //Table columns
        this.columnsList = ['roleid', 'name', 'description', 'datetime', 'status'];

        //Call to create table if not exist
        this.createTable();
    }

    //Insert method
    async insertTable(columns) {
        await this.createTable();
        try {
            const placeholders = this.columnsList.map(() => '?').join(',');
            const sql = `INSERT IGNORE INTO role (${this.columnsList.join(',')}) VALUES (${placeholders})`;
            const result = await this.Database.setupConnection({ sql, columns }, 'object');
            return result;
        } catch (error) {
            console.error('Insert Role Error:', error);
            return { error: true, message: error.message };
        }
    }

    //Update method
    async updateTable (object) {
        try {
            let sql = 'UPDATE role SET '+object.sql;
            let result = await this.Database.setupConnection({sql: sql, columns: object.columns}, 'object');
            return result;
        } catch (error) {
            return error;
        }
    }

    //Fetch for prepared statement
    async preparedFetch (object) {
        try {
            let sql = 'SELECT * FROM role WHERE '+object.sql;
            let result = await this.Database.setupConnection({sql: sql, columns: object.columns}, 'object');
            return result;
        } catch (error) {
            return error;
        }
    }

    //Create table method
    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: 'role',

            createTableStatement: (`
                roleid BIGINT(100) PRIMARY KEY,
                name varchar(255) UNIQUE,
                description varchar(255),
                datetime datetime,
                status varchar(50)
            `),

            foreignKeyStatement: (``),

            alterTableStatement: []
        });
        let result = await CreateUpdateTable.checkTableExistence();
        return result;
    }

}

module.exports = Role;