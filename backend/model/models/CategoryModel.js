const CreateUpdateModel = require('../app/CreateUpdateModel');

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
    async insertTable (columns) {
        let result = await this.createTable();
        try {
            if (result) {
                let sql = `
                    INSERT IGNORE INTO category (${this.columnsList.toString()}) VALUES (?,?,?,?,?);
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