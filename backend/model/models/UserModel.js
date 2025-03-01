const Session = require('./SessionModel');
const CreateUpdateModel = require('../app/CreateUpdateModel');

//Intialize Class
class User {

    //Constructor 
    constructor (Database) {
        //Create foreign key tables
        this.SessionModel = new Session(Database);

        this.Database = Database;

        //Table columns
        this.columnsList = ['userid', 'first_name', 'last_name', 'phone', 'email', 'address', 'username', 'password', 'status', 'date_time'];

        //Call to create table if not exist
        this.createTable();
    }

    //Insert method
    async insertTable (columns) {
        let result = await this.createTable();
        try {
            if (result) {
                let sql = `
                    INSERT INTO user (${this.columnsList.toString()}) VALUES (?,?,?,?,?,?,?,?,?,?);
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
            let sql = 'UPDATE user SET '+object.sql;
            let result = await this.Database.setupConnection({sql: sql, columns: object.columns}, 'object');
            return result;
        } catch (error) {
            return error;
        }
    }

    //Fetch for prepared statement
    async preparedFetch (object) {
        try {
            let sql = 'SELECT * FROM user WHERE '+object.sql;
            let result = await this.Database.setupConnection({sql: sql, columns: object.columns}, 'object');
            return result;
        } catch (error) {
            return error;
        }
    }

    //Create table method
    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: 'user',

            createTableStatement: (`
                userid BIGINT(100) PRIMARY KEY,
                first_name varchar(255),
                last_name varchar(255),
                phone varchar(50),
                email varchar(255),
                address varchar(255),
                username varchar(50
                password text,
                status varchar(50),
                date_time datetime
            `),

            foreignKeyStatement: (`
                ALTER TABLE user ADD FOREIGN KEY(sessionid) REFERENCES session(sessionid); 
            `),

            alterTableStatement: []
        });
        let result = await CreateUpdateTable.checkTableExistence();
        return result;
    }

}

module.exports = User;