const CreateUpdateModel = require('./CreateUpdateModel');

//Intialize Class
class Session {

    //Constructor 
    constructor (Database) {
        this.Database = Database;

        //Table columns
        this.columnsList = ['sessionid', 'userid', 'activity', 'datetime', 'logout'];

        //Call to create table if not exist
        this.createTable();
    }

    //Insert method
    async insertTable(columns) {
        await this.createTable();
        try {
            const placeholders = this.columnsList.map(() => '?').join(',');
            const sql = `INSERT INTO session (${this.columnsList.join(',')}) VALUES (${placeholders})`;
            const result = await this.Database.setupConnection({ sql, columns }, 'object');
            return result;
        } catch (error) {
            console.error('Insert Session Error:', error);
            return { error: true, message: error.message };
        }
    }

    //Update method
    async updateTable (object) {
        try {
            let sql = 'UPDATE session SET '+object.sql;
            let result = await this.Database.setupConnection({sql: sql, columns: object.columns}, 'object');
            return result;
        } catch (error) {
            return error;
        }
    }

    //Fetch for prepared statement
    async preparedFetch (object) {
        try {
            let sql = 'SELECT * FROM session WHERE '+object.sql;
            let result = await this.Database.setupConnection({sql: sql, columns: object.columns}, 'object');
            return result;
        } catch (error) {
            return error;
        }
    }

    //Create table method
    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: 'session',

            createTableStatement: (`
                sessionid BIGINT(100) PRIMARY KEY,
                userid BIGINT(100),
                activity VARCHAR(100),
                datetime datetime,
                logout datetime
            `),

            foreignKeyStatement: (``),

            alterTableStatement: []
        });
        let result = await CreateUpdateTable.checkTableExistence();
        return result;
    }

}

module.exports = Session;