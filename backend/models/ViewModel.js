const User = require('./UserModel');
const Product = require('./ProductModel');
const Category = require('./CategoryModel');
const Service = require('./ServiceModel');
const Session = require('./SessionModel');
const Transaction = require('./TransactionModel');
const CreateUpdateModel = require('./CreateUpdateModel');

class ViewModel {
    constructor(Database) {
        this._UserModel = new User(Database);
        this._ProductModel = new Product(Database);
        this._CategoryModel = new Category(Database);
        this._ServiceModel = new Service(Database);
        this._SessionModel = new Session(Database);
        this._TransactionModel = new Transaction(Database);
        this._Database = Database;
    }

    /**
     * Fetch all columns from a view or table using dynamic WHERE clause.
     * @param {object} object
     * @param {string} object.table - Table or view name.
     * @param {string} object.sql - WHERE clause with prepared placeholders.
     * @param {array} object.columns - Placeholder values.
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
     * Fetch specific columns from a view or table using dynamic WHERE clause.
     * @param {object} object
     * @param {string} object.select - Columns to select.
     * @param {string} object.table - Table or view name.
     * @param {string} object.sql - WHERE clause with prepared placeholders.
     * @param {array} object.columns - Placeholder values.
     */
    async getGeneralSpecific(object) {
        try {
            const isValidView = await this.viewChecker(object.table);
            if (!isValidView) return [];

            const sql = `SELECT ${object.select} FROM ${object.table} WHERE ${object.sql}`;
            const rows = await this._Database.setupConnection({ sql, columns: object.columns }, 'object');

            if (!Array.isArray(rows)) console.log(rows);
            return Array.isArray(rows) ? rows : [];
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    /**
     * Confirms if view should exist or be (re)created.
     * @param {string} table - View or table name.
     */
    async viewChecker(table) {
        if (table === 'transaction_view') {
            return await this.createTransactionView();
        }
        return true;
    }

    /**
     * Dynamically (re)creates the transaction_view if needed.
     */
    async createTransactionView() {
        const CreateUpdateTable = new CreateUpdateModel(this._Database, {
            tableName: 'transaction_view',
            createTableStatement: (`
            SELECT 
                t1.transactionid,
                t1.product_service,
                t1.itemtype,
                t1.userid,
                t1.merchant,
                t1.amount,
                t1.datetime,
                t1.message,
                t1.status AS transaction_status,

                u.username,
                u.email,
                u.status AS user_status,
                CONCAT(u.first_name, ' ', u.last_name) AS full_name,

                m.name AS merchant_name,

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

            FROM transaction t1
            LEFT JOIN user u ON u.userid = t1.userid
            LEFT JOIN merchant m ON m.merchantid = t1.merchant
            LEFT JOIN product p ON p.productid = t1.product_service AND t1.itemtype = 'product'
            LEFT JOIN category c ON c.categoryid = p.categoryid
            LEFT JOIN service s ON s.serviceid = t1.product_service AND t1.itemtype = 'service'
            LEFT JOIN category cs ON cs.categoryid = s.categoryid
        `)
        });

        return await CreateUpdateTable.createView();
    }

}

module.exports = ViewModel;
