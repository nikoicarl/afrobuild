const User = require('./UserModel');
const Product = require('./ProductModel');
const Category = require('./CategoryModel');
const Service = require('./ServiceModel');
const Session = require('./SessionModel');
const Transaction = require('./TransactionModel');
const TransactionItems = require('./TransactionItemsModel');
const CreateUpdateModel = require('./CreateUpdateModel');

class ViewModel {
    constructor(Database) {
        this._UserModel = new User(Database);
        this._ProductModel = new Product(Database);
        this._CategoryModel = new Category(Database);
        this._ServiceModel = new Service(Database);
        this._SessionModel = new Session(Database);
        this._TransactionModel = new Transaction(Database);
        this._TransactionItemsModel = new TransactionItems(Database);
        this.Database = Database;
    }

    /**
     * Fetch all columns from a view or table using dynamic WHERE clause.
     */
    async getGeneral({ table, sql, columns }) {
        try {
            const viewExists = await this.viewChecker(table);
            if (!viewExists) return [];

            const query = `SELECT * FROM ${table} WHERE ${sql}`;
            const result = await this.Database.setupConnection({ sql: query, columns }, 'object');

            if (!Array.isArray(result)) console.log(result);
            return Array.isArray(result) ? result : [];
        } catch (error) {
            console.error('[getGeneral Error]:', error);
            return [];
        }
    }

    /**
     * Fetch specific columns from a view or table using dynamic WHERE clause.
     */
    async getGeneralSpecific({ select, table, sql, columns }) {
        try {
            const viewExists = await this.viewChecker(table);
            if (!viewExists) return [];

            const query = `SELECT ${select} FROM ${table} WHERE ${sql}`;
            const rows = await this.Database.setupConnection({ sql: query, columns }, 'object');

            if (!Array.isArray(rows)) console.log(rows);
            return Array.isArray(rows) ? rows : [];
        } catch (error) {
            console.error('[getGeneralSpecific Error]:', error);
            return [];
        }
    }

    /**
     * Confirms if view should exist or be (re)created.
     */
    async viewChecker(table) {
        if (table === 'transaction_view') {
            return await this.createTransactionView();
        }
        return true;
    }

    async createTransactionView() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: 'transaction_view',
            createTableStatement: `
            SELECT 
                t.transactionid,
                t.userid,
                t.amount,
                t.message,
                t.datetime,
                t.status,

                u.first_name AS customer_first_name,
                u.last_name AS customer_last_name,

                ti.transaction_itemsid,
                ti.itemtype,
                ti.product_service,
                ti.category,
                ti.price AS unit_price,
                ti.quantity,
                ti.subtotal,

                CASE 
                    WHEN ti.itemtype = 'product' THEN p.name
                    WHEN ti.itemtype = 'service' THEN s.name
                    ELSE ti.name
                END AS item_name,

                c.name AS category_name,

                mu.first_name AS merchant_first_name,
                mu.last_name AS merchant_last_name

            FROM transaction t
            LEFT JOIN transaction_items ti ON ti.transactionid = t.transactionid
            LEFT JOIN product p ON p.productid = ti.product_service AND ti.itemtype = 'product'
            LEFT JOIN service s ON s.serviceid = ti.product_service AND ti.itemtype = 'service'
            LEFT JOIN category c ON c.categoryid = ti.category
            LEFT JOIN user u ON u.userid = t.userid
            LEFT JOIN user mu ON mu.userid = CASE 
                WHEN ti.itemtype = 'product' THEN p.userid
                WHEN ti.itemtype = 'service' THEN s.userid
                ELSE NULL
            END;
        `
        });

        return await CreateUpdateTable.createView();
    }

}

module.exports = ViewModel;
