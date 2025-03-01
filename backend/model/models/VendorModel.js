const Session = require('./SessionModel');
const CreateUpdateModel = require('../app/CreateUpdateModel');

//Intialize Class
class Vendor {

    //Constructor 
    constructor (Database) {
        //Create foreign key tables
        this.SessionModel = new Session(Database);

        this.Database = Database;

        //Table columns
        this.columnsList = ['vendorid', 'name', 'phone', 'email', 'address', 'status', 'date_time'];

        //Call to create table if not exist
        this.createTable();
    }

    //Insert method
    async insertTable (columns) {
        let result = await this.createTable();
        try {
            if (result) {
                let sql = `
                    INSERT INTO vendor (${this.columnsList.toString()}) VALUES (?,?,?,?,?,?,?);
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
            let sql = 'UPDATE vendor SET '+object.sql;
            let result = await this.Database.setupConnection({sql: sql, columns: object.columns}, 'object');
            return result;
        } catch (error) {
            return error;
        }
    }

    //Fetch for prepared statement
    async preparedFetch (object) {
        try {
            let sql = 'SELECT * FROM vendor WHERE '+object.sql;
            let result = await this.Database.setupConnection({sql: sql, columns: object.columns}, 'object');
            return result;
        } catch (error) {
            return error;
        }
    }

    //Create table method
    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: 'vendor',

            createTableStatement: (`
                vendorid BIGINT(100) PRIMARY KEY,
                name varchar(255),
                phone varchar(50),
                email varchar(255),
                address varchar(255),
                status varchar(50),
                date_time datetime
            `),

            foreignKeyStatement: (`
                ALTER TABLE vendor ADD FOREIGN KEY(sessionid) REFERENCES session(sessionid); 
            `),

            alterTableStatement: []
        });
        let result = await CreateUpdateTable.checkTableExistence();
        return result;
    }

}

module.exports = Vendor;