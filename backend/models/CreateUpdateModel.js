const ini = require('ini');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, `../../system.env`) });

class CreateUpdateModel {
    constructor(Database, Statements) {
        this.config = {
            DB_NAME: process.env.DB_NAME
        };
        this.Database = Database;
        this.tableName = Statements.tableName.trim();
        this.createTableStatement = Statements.createTableStatement;
        this.alterTableStatement = Statements.alterTableStatement;
        this.foreignKeyStatement = Statements.foreignKeyStatement;
        this.alterViewTableStatement = Statements.alterViewTableStatement;
        this.primaryKey = this.createTableStatement.split('BIGINT(100) PRIMARY KEY')[0];
    }

    async checkTableExistence() {
        if (!this.checkIfValue(this.tableName)) return false;

        const exists = await this.checkIfTableExist(this.tableName, 'BASE TABLE');
        if (exists) {
            await this.alterTable();
            await this.addForeignKeys();
            return true;
        } else {
            return await this.createTable();
        }
    }

    async createTable() {
        try {
            if (this.checkIfValue(this.tableName) && this.checkIfValue(this.createTableStatement)) {
                const sql = `
                    CREATE TABLE IF NOT EXISTS ${this.tableName} (
                        ${this.createTableStatement}
                    );
                `;
                const result = await this.Database.setupConnection(sql, 'sql');
                if (result?.affectedRows !== undefined) {
                    await this.addForeignKeys();
                    return true;
                } else {
                    console.log(`${this.tableName} Create Table Result => `, result);
                    return false;
                }
            }
            return false;
        } catch (error) {
            console.error(`${this.tableName} Create Table Error => `, error);
            return false;
        }
    }

    async createView() {
    if (!this.checkIfValue(this.tableName) || !this.checkIfValue(this.createTableStatement)) {
        console.error('Missing table name or createTableStatement for view creation.');
        return false;
    }

    try {
        const exists = await this.checkIfTableExist(this.tableName, 'VIEW');

        if (exists) {
            const dropSql = `DROP VIEW IF EXISTS \`${this.tableName}\``;
            await this.Database.setupConnection({ sql: dropSql, columns: [] }, 'sql');
        }

        const createSql = `CREATE VIEW \`${this.tableName}\` AS ${this.createTableStatement}`;

        const result = await this.Database.setupConnection({ sql: createSql, columns: [] }, 'sql');

        return result?.affectedRows !== undefined || result === true;
    } catch (error) {
        console.error(`${this.tableName} Create View Error =>`, error);
        return false;
    }
}


    async checkIfTableExist(tableName, tableType) {
        try {
            const sql = `
                SELECT * FROM information_schema.tables 
                WHERE TABLE_SCHEMA = '${this.config.DB_NAME}' 
                AND TABLE_NAME = '${tableName}' 
                AND TABLE_TYPE = '${tableType}'
            `;
            const result = await this.Database.setupConnection(sql, 'sql');
            return Array.isArray(result) && result.length > 0;
        } catch (error) {
            return false;
        }
    }

    async addForeignKeys() {
        try {
            if (!this.checkIfValue(this.tableName) || !this.checkIfValue(this.foreignKeyStatement)) return false;

            const expectedCount = (this.foreignKeyStatement.match(/ADD FOREIGN KEY/g) || []).length;

            const existingSql = `
                SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = '${this.config.DB_NAME}' 
                AND TABLE_NAME = '${this.tableName}' 
                AND CONSTRAINT_NAME LIKE '%ibfk%'
            `;
            const existingKeys = await this.Database.setupConnection(existingSql, 'sql');

            if (Array.isArray(existingKeys) && existingKeys.length > expectedCount) {
                for (const { CONSTRAINT_NAME } of existingKeys) {
                    const dropSql = `ALTER TABLE ${this.tableName} DROP FOREIGN KEY ${CONSTRAINT_NAME};`;
                    await this.Database.setupConnection(dropSql, 'sql');
                }
            }

            const alterSql = `ALTER TABLE ${this.tableName} ${this.foreignKeyStatement};`;
            await this.Database.setupConnection(alterSql, 'sql');

            return true;
        } catch (error) {
            console.error(`${this.tableName} Foreign Key Error => `, error);
            return false;
        }
    }

    async alterTable() {
        try {
            if (!this.checkIfValue(this.tableName)) return false;

            const pkSql = `
                SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = '${this.config.DB_NAME}' 
                AND TABLE_NAME = '${this.tableName}' 
                AND CONSTRAINT_NAME = 'PRIMARY'
            `;
            const pkResult = await this.Database.setupConnection(pkSql, 'sql');
            if (!Array.isArray(pkResult) || pkResult.length === 0) {
                const addPkSql = `ALTER TABLE ${this.tableName} ADD PRIMARY KEY(${this.primaryKey});`;
                await this.Database.setupConnection(addPkSql, 'sql');
            }

            if (Array.isArray(this.alterTableStatement)) {
                for (const def of this.alterTableStatement) {
                    const [column, datatype] = def.split('-');
                    const checkSql = `SHOW COLUMNS FROM ${this.tableName} LIKE '${column}';`;
                    const colResult = await this.Database.setupConnection(checkSql, 'sql');
                    if (!Array.isArray(colResult) || colResult.length === 0) {
                        const addColSql = `ALTER TABLE ${this.tableName} ADD COLUMN ${column} ${datatype};`;
                        await this.Database.setupConnection(addColSql, 'sql');
                    }
                }
            }

            return true;
        } catch (error) {
            console.error(`${this.tableName} Alter Table Error => `, error);
            return false;
        }
    }

    async alterViewTable() {
        if (!this.checkIfValue(this.tableName) || !Array.isArray(this.alterViewTableStatement)) return true;

        try {
            const needsUpdate = await Promise.all(this.alterViewTableStatement.map(async item => {
                const sql = `SHOW COLUMNS FROM ${this.tableName} LIKE '${item}';`;
                const result = await this.Database.setupConnection(sql, 'sql');
                return !(Array.isArray(result) && result.length > 0);
            }));

            if (needsUpdate.includes(true)) {
                const dropSql = `DROP VIEW IF EXISTS ${this.tableName};`;
                await this.Database.setupConnection(dropSql, 'sql');
                return await this.createView();
            }

            return true;
        } catch (error) {
            console.error(`${this.tableName} Alter View Table Error => `, error);
            return false;
        }
    }

    async createTrigger() {
        try {
            if (!this.checkIfValue(this.tableName)) return false;

            const sql = `
                SELECT * FROM INFORMATION_SCHEMA.TRIGGERS 
                WHERE TRIGGER_SCHEMA = '${this.config.DB_NAME}' 
                AND EVENT_OBJECT_TABLE = '${this.tableName}';
            `;
            const result = await this.Database.setupConnection(sql, 'sql');
            if (Array.isArray(result) && result.length > 0) return true;

            const trigger1 = `
                CREATE TRIGGER ${this.tableName}_insert_backup_trigger AFTER INSERT ON ${this.tableName}
                FOR EACH ROW
                INSERT INTO db_backup(table_name, rowid, type, date_time)
                VALUES('${this.tableName}', NEW.${this.primaryKey}, 'insert', UTC_TIMESTAMP());
            `;
            const trigger2 = `
                CREATE TRIGGER ${this.tableName}_update_backup_trigger AFTER UPDATE ON ${this.tableName}
                FOR EACH ROW
                INSERT INTO db_backup(table_name, rowid, type, date_time)
                VALUES('${this.tableName}', NEW.${this.primaryKey}, 'update', UTC_TIMESTAMP());
            `;
            await this.Database.setupConnection(trigger1, 'sql');
            await this.Database.setupConnection(trigger2, 'sql');
            return true;
        } catch (error) {
            console.error(`${this.tableName} Create Trigger Error => `, error);
            return false;
        }
    }

    checkIfValue(value) {
        if (
            value === '' ||
            value === ' ' ||
            value === undefined ||
            value === null ||
            (typeof value === 'object' && Object.keys(value).length === 0) ||
            (typeof value === 'string' && value.trim().length === 0)
        ) {
            return false;
        }
        return true;
    }
}

module.exports = CreateUpdateModel;
