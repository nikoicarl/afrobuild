const CreateUpdateModel = require('./CreateUpdateModel');

class TransactionItem {
    constructor(Database) {
        this.Database = Database;

        this.tableName = 'transaction_items';
        this.columnsList = [
            'transaction_itemsid', 'transactionid', 'product_service', 'itemtype',
            'category', 'name', 'price', 'quantity', 'subtotal'
        ];

        this.createTable();
    }

    async createTable() {
        const CreateUpdateTable = new CreateUpdateModel(this.Database, {
            tableName: this.tableName,
            createTableStatement: `
                transaction_itemsid BIGINT(100) PRIMARY KEY,
                transactionid BIGINT,
                product_service BIGINT,
                itemtype VARCHAR(50),
                category BIGINT,
                name VARCHAR(255) ,
                price DECIMAL(10,2),
                quantity INT,
                subtotal DECIMAL(10,2)
            `,
            foreignKeyStatement: `
                FOREIGN KEY (transactionid) REFERENCES transaction(transactionid) ON DELETE CASCADE
            `,
            alterTableStatement: []
        });

        return await CreateUpdateTable.checkTableExistence();
    }

    async insertItem(columns) {
        await this.createTable();
        try {
            const placeholders = this.columnsList.map(() => '?').join(',');
            const sql = `INSERT IGNORE INTO ${this.tableName} (${this.columnsList.join(',')}) VALUES (${placeholders})`;
            return await this.Database.setupConnection({ sql, columns }, 'object');
        } catch (error) {
            console.error('[Insert Transaction Item Error]:', error);
            return { error: true, message: error.message };
        }
    }

    async fetchByTransactionID(transactionId) {
        try {
            const sql = `SELECT * FROM ${this.tableName} WHERE transactionid = ?`;
            return await this.Database.setupConnection({ sql, columns: [transactionId] }, 'object');
        } catch (error) {
            console.error('[Fetch Transaction Items Error]:', error);
            return [];
        }
    }
}

module.exports = TransactionItem;
