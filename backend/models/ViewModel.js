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
        this.Database = Database;
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
                let result = await this.Database.setupConnection({ sql: sql, columns: object.columns }, 'object');
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
            const rows = await this.Database.setupConnection({ sql, columns: object.columns }, 'object');

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
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: 'transaction_view',
            createTableStatement: (`
            SELECT 
                t.transactionid,
                t.userid,
                t.amount,
                t.message,
                t.datetime,
                t.status AS transaction_status,

                ti.transaction_itemsid,
                ti.product_service,
                ti.itemtype,
                ti.category AS categoryid,
                ti.name AS item_name,
                ti.price AS item_price,
                ti.quantity,
                ti.subtotal,

                u.username,
                u.email,
                u.status AS user_status,
                CONCAT(u.first_name, ' ', u.last_name) AS full_name,

                -- Get merchant name from either product or service owner
                CONCAT(mu.first_name, ' ', mu.last_name) AS merchant_name,

                -- Get category name based on item type
                CASE 
                    WHEN ti.itemtype = 'product' THEN c.name
                    WHEN ti.itemtype = 'service' THEN cs.name
                    ELSE NULL
                END AS category_name

            FROM transaction_items ti
            LEFT JOIN transaction t ON t.transactionid = ti.transactionid
            LEFT JOIN user u ON u.userid = t.userid

            LEFT JOIN product p ON p.productid = ti.product_service AND ti.itemtype = 'product'
            LEFT JOIN service s ON s.serviceid = ti.product_service AND ti.itemtype = 'service'

            LEFT JOIN user mu ON mu.userid = 
                CASE 
                    WHEN ti.itemtype = 'product' THEN p.userid
                    WHEN ti.itemtype = 'service' THEN s.userid
                    ELSE NULL
                END

            LEFT JOIN category c ON c.categoryid = p.categoryid
            LEFT JOIN category cs ON cs.categoryid = s.categoryid
        `)
        });

        return await CreateUpdateTable.createView();
    }

}

module.exports = ViewModel;
