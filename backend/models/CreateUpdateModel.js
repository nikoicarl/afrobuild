const ini = require('ini');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../../system.env') });

class CreateUpdateModel {
    constructor(Database, Statements) {
        this.confiq = {
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
        if (this.checkIfValue(this.tableName)) {
            const exists = await this.checkIfTableExist(this.tableName, 'BASE TABLE');
            if (exists) {
                await this.alterTable();
                await this.addForeignKeys();
                return true;
            } else {
                return await this.createTable();
            }
        }
        return false;
    }

    async createTable() {
        try {
            if (this.checkIfValue(this.tableName) && this.checkIfValue(this.createTableStatement)) {
                const sql = `
                    CREATE TABLE IF NOT EXISTS \`${this.tableName}\` (
                        ${this.createTableStatement}
                    );
                `;
                const result = await this.Database.setupConnection(sql, 'sql');

                if (result && typeof result.affectedRows !== 'undefined') {
                    if (typeof this.addForeignKeys === 'function') {
                        await this.addForeignKeys();
                    }
                    return true;
                } else {
                    console.error(`${this.tableName} Create Table:: =>`, result);
                    return false;
                }
            }
            console.warn('Missing tableName or createTableStatement');
            return false;
        } catch (error) {
            console.error(`${this.tableName} Create Table: =>`, error);
            return false;
        }
    }

    async createView() {
        if (this.checkIfValue(this.tableName) && this.checkIfValue(this.createTableStatement)) {
            try {
                const exists = await this.checkIfTableExist(this.tableName, 'VIEW');
                if (exists) {
                    return await this.alterViewTable();
                } else {
                    const sql = `CREATE VIEW ${this.tableName} AS ${this.createTableStatement};`;
                    const result = await this.Database.setupConnection(sql, 'sql');
                    return result && typeof result.affectedRows !== 'undefined';
                }
            } catch (error) {
                console.error(this.tableName + ' Create View: => ', error);
                return false;
            }
        }
        return false;
    }

    async checkIfTableExist(tableName, tableType) {
        try {
            const sql = `
                SELECT * FROM information_schema.tables 
                WHERE TABLE_SCHEMA = '${this.confiq.DB_NAME}' 
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

            const keyCount = this.foreignKeyStatement.split('ADD FOREIGN KEY').length - 1;
            const keyCheckSql = `
                SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = '${this.confiq.DB_NAME}' 
                AND TABLE_NAME = '${this.tableName}' 
                AND CONSTRAINT_NAME LIKE '%ibfk%'
            `;
            const existingKeys = await this.Database.setupConnection(keyCheckSql, 'sql');

            if (Array.isArray(existingKeys) && existingKeys.length > keyCount) {
                for (const key of existingKeys) {
                    const dropSql = `ALTER TABLE ${this.tableName} DROP FOREIGN KEY ${key.CONSTRAINT_NAME};`;
                    await this.Database.setupConnection(dropSql, 'sql');
                }
            }

            // Re-add new foreign keys
            const result = await this.Database.setupConnection(this.foreignKeyStatement, 'sql');
            return result ? true : false;
        } catch (error) {
            console.error(this.tableName + ' Foreign Key Altering: => ', error);
            return false;
        }
    }

    async alterTable() {
        try {
            if (!this.checkIfValue(this.tableName)) return false;

            const primaryCheckSql = `
                SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = '${this.confiq.DB_NAME}' 
                AND TABLE_NAME = '${this.tableName}' 
                AND CONSTRAINT_NAME = 'PRIMARY'
            `;
            const primaryExists = await this.Database.setupConnection(primaryCheckSql, 'sql');

            if (!primaryExists || primaryExists.length === 0) {
                const primarySql = `ALTER TABLE ${this.tableName} ADD PRIMARY KEY(${this.primaryKey});`;
                await this.Database.setupConnection(primarySql, 'sql');
            }

            if (Array.isArray(this.alterTableStatement)) {
                for (const item of this.alterTableStatement) {
                    const [column, datatype] = item.split("-");
                    const checkSql = `SHOW COLUMNS FROM ${this.tableName} LIKE '${column}';`;
                    const result = await this.Database.setupConnection(checkSql, 'sql');
                    if (!result || result.length === 0) {
                        const alterSql = `ALTER TABLE ${this.tableName} ADD COLUMN ${column} ${datatype};`;
                        await this.Database.setupConnection(alterSql, 'sql');
                    }
                }
            }
            return true;
        } catch (error) {
            console.error(this.tableName + ' Alter Table: => ', error);
            return true; // optionally return false here
        }
    }

    async alterViewTable() {
        try {
            if (!this.checkIfValue(this.tableName) || !Array.isArray(this.alterViewTableStatement)) return true;

            const needsAlter = [];
            for (const item of this.alterViewTableStatement) {
                const sql = `SHOW COLUMNS FROM ${this.tableName} LIKE '${item}';`;
                const result = await this.Database.setupConnection(sql, 'sql');
                if (!Array.isArray(result) || result.length === 0) {
                    needsAlter.push(true);
                }
            }

            if (needsAlter.includes(true)) {
                const dropSql = `DROP VIEW ${this.tableName};`;
                const dropResult = await this.Database.setupConnection(dropSql, 'sql');
                return dropResult ? await this.createView() : true;
            }

            return true;
        } catch (error) {
            console.error(this.tableName + ' Alter View Table: => ', error);
            return false;
        }
    }

    async createTrigger() {
        try {
            if (!this.checkIfValue(this.tableName)) return false;

            const sql = `
                SELECT * FROM INFORMATION_SCHEMA.TRIGGERS 
                WHERE TRIGGER_SCHEMA = '${this.confiq.DB_NAME}' 
                AND EVENT_OBJECT_TABLE = '${this.tableName}'
            `;
            const result = await this.Database.setupConnection(sql, 'sql');
            if (Array.isArray(result) && result.length > 0) return true;

            const triggerInsertSql = `
                CREATE TRIGGER ${this.tableName}_insert_backup_trigger 
                AFTER INSERT ON ${this.tableName}
                FOR EACH ROW 
                INSERT INTO db_backup(table_name, rowid, type, date_time)
                VALUES('${this.tableName}', NEW.${this.primaryKey}, 'insert', UTC_TIMESTAMP());
            `;

            const triggerUpdateSql = `
                CREATE TRIGGER ${this.tableName}_update_backup_trigger 
                AFTER UPDATE ON ${this.tableName}
                FOR EACH ROW 
                INSERT INTO db_backup(table_name, rowid, type, date_time)
                VALUES('${this.tableName}', NEW.${this.primaryKey}, 'update', UTC_TIMESTAMP());
            `;

            await this.Database.setupConnection(triggerInsertSql, 'sql');
            await this.Database.setupConnection(triggerUpdateSql, 'sql');

            return true;
        } catch (error) {
            console.error(this.tableName + ' Creating triggers: => ', error);
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
