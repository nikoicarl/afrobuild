const User = require('./UserModel');
const Product = require('./ProductModel');
const Category = require('./CategoryModel');
const Service = require('./ServiceModel');
const Session = require('./SessionModel');
const Transaction = require('./TransactionModel');
const CreateUpdateModel = require('./CreateUpdateModel');


//Intialize Class
class ViewModel {

    //Constructor 
    constructor(Database) {
        this._UserModel = new User(Database);
        this._ProductModel = new Product(Database);
        this._CategoryModel = new Category(Database);
        this._ServiceModel = new Service(Database);
        this._SessionModel = new Session(Database);
        this._TransactionModel = new Transaction(Database);
        this._Database = Database;
    }

    //====================================================================================//
    //GET VIEWS HERE
    /**
     * This method is used to perform all kinds of fetches
     * @param {object} object - main object containing expected variables for the fetching
     * @param {string} object.table - the table name you are making the fetch from
     * @param {string} object.sql - the sql statement clause (the clause after WHERE clause of an sql statement) with prepared statements formart (?)
     * @param {array} object.columns - the values that will be in place of the prepared statement (?)
     */
    async getGeneral(object) {
        try {
            let result = await this.viewChecker(object.table);
            if (result) {
                let sql = 'SELECT * FROM ' + object.table + ' WHERE ' + object.sql;
                let result = await this._Database.setupConnection({ sql: sql, columns: object.columns }, 'object');
                (!Array.isArray(result)) ? console.log(result) : '';
                return Array.isArray(result) ? result : [];
            } else {
                return [];
            }
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    /**
     * This method is used to perform all kinds of fetches
     * @param {object} object - main object containing expected variables for the fetching
     * @param {string} object.select - the sql select statement
     * @param {string} object.table - the table name you are making the fetch from
     * @param {string} object.sql - the sql statement clause (the clause after WHERE clause of an sql statement) with prepared statements formart (?)
     * @param {array} object.columns - the values that will be in place of the prepared statement (?)
     */
    async getGeneralSpecific(object) {
        try {
            let result = await this.viewChecker(object.table);
            if (result) {
                let sql = 'SELECT ' + object.select + ' FROM ' + object.table + ' WHERE ' + object.sql;
                let result = await this._Database.setupConnection({ sql: sql, columns: object.columns }, 'object');
                (!Array.isArray(result)) ? console.log(result) : '';
                return Array.isArray(result) ? result : [];
            } else {
                return [];
            }
        } catch (error) {
            console.log(error);
            return [];
        }
    }


    //====================================================================================//
    //VIEW CHECKER
    async viewChecker(table) {
        if (table == 'transaction_view') {
            return await this.createTransactionView();
        } else {
            return true;
        }
    }

    //====================================================================================//
    //CREATE VIEWS HERE
    async createTransactionView() {
        const CreateUpdateTable = new CreateUpdateModel(this._Database, {
            tableName: 'transaction_view',

            createTableStatement: (`
                    SELECT 
                            t1.transactionid,
                            t1.itemid,
                            t1.itemtype,
                            t1.userid,
                            t1.amount,
                            t1.datetime,

                            u.username,
                            u.email,
                            u.status AS user_status,
                            CONCAT(u.first_name, ' ', u.last_name) AS full_name,

                            CASE 
                                WHEN t1.itemtype = 'product' THEN p.name
                                WHEN t1.itemtype = 'service' THEN s.name
                            END AS item_name,

                            CASE 
                                WHEN t1.itemtype = 'product' THEN p.price
                                WHEN t1.itemtype = 'service' THEN s.price
                            END AS item_price,

                            CASE 
                                WHEN t1.itemtype = 'product' THEN c.name
                                WHEN t1.itemtype = 'service' THEN cs.name
                            END AS category_name

                        FROM 
                            transaction t1

                        LEFT JOIN user u 
                            ON u.userid = t1.userid

                        LEFT JOIN product p 
                            ON p.productid = t1.itemid AND t1.itemtype = 'product'

                        LEFT JOIN category c 
                            ON c.categoryid = p.categoryid

                        LEFT JOIN service s 
                            ON s.serviceid = t1.itemid AND t1.itemtype = 'service'

                        LEFT JOIN category cs 
                            ON cs.categoryid = s.categoryid

                    WHERE 1
                `)
        });
        let result = await CreateUpdateTable.createView();
        return result;
    }
}

module.exports = ViewModel;