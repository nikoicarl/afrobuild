const CreateUpdateModel = require('../../app/CreateUpdateModel');

//Intialize Class
class Setup {

    //Constructor 
    constructor (Database) {
        this.Database = Database;

        //Table columns
        this.columnsList = ['setupid', 'name', 'email', 'phone', 'address', 'country', 'state_region', 'city', 'zipcode', 'logo', 'primary_color', 'status', 'date_time', 'sessionid'];

        //Call to create table if not exist
        this.createTable();
    }

    //Insert method
    async insertTable (columns) {
        let result = await this.createTable();
        try {
            if (result) {
                let sql = `
                    INSERT INTO setup (${this.columnsList.toString()}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?);
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
            let sql = 'UPDATE setup SET '+object.sql;
            let result = await this.Database.setupConnection({sql: sql, columns: object.columns}, 'object');
            return result;
        } catch (error) {
            return error;
        }
    }

    //Fetch for prepared statement
    async preparedFetch (object) {
        try {
            let sql = 'SELECT * FROM setup WHERE '+object.sql;
            let result = await this.Database.setupConnection({sql: sql, columns: object.columns}, 'object');
            return result;
        } catch (error) {
            return error;
        }
    }

    //Create table method
    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: 'setup',

            createTableStatement: (`
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
            `),

            foreignKeyStatement: (``),

            alterTableStatement: ['']
        });
        let result = await CreateUpdateTable.checkTableExistence();
        return result;
    }
}

module.exports = Setup ;