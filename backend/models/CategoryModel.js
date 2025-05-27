const CreateUpdateModel = require('./CreateUpdateModel');

//Intialize Class
class Category {

    //Constructor 
    constructor (Database) {
        this.Database = Database;

        //Table columns
        this.columnsList = ['categoryid', 'name', 'description', 'datetime', 'status'];

        //Call to create table if not exist
        this.createTable();
    }

    //Insert method
    async insertTable(columns) {
        await this.createTable();
        try {
            const placeholders = this.columnsList.map(() => '?').join(',');
            const sql = `INSERT INTO category (${this.columnsList.join(',')}) VALUES (${placeholders})`;
            const result = await this.Database.setupConnection({ sql, columns }, 'object');
            return result;
        } catch (error) {
            console.error('Insert Category Error:', error);
            return { error: true, message: error.message };
        }
    }

    //Update method
    async updateTable (object) {
        try {
            let sql = 'UPDATE category SET '+object.sql;
            let result = await this.Database.setupConnection({sql: sql, columns: object.columns}, 'object');
            return result;
        } catch (error) {
            return error;
        }
    }

    //Fetch for prepared statement
    async preparedFetch (object) {
        try {
            let sql = 'SELECT * FROM category WHERE '+object.sql;
            let result = await this.Database.setupConnection({sql: sql, columns: object.columns}, 'object');
            return result;
        } catch (error) {
            return error;
        }
    }

    //Create table method
    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: 'category',

            createTableStatement: (`
                categoryid BIGINT(100) PRIMARY KEY,
                name varchar(255),
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

module.exports = Category;