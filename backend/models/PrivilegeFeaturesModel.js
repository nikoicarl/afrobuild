const CreateUpdateModel = require('./CreateUpdateModel');
const Apps = require('./AppsModel');
const CombinePrivilege = require('./CombinePrivilegeModel');
const GeneralFunction = require('./GeneralFunctionModel');
const gf = new GeneralFunction();

const PrivilegeAfrobuild = require('./AfrobuildModel');

class PrivilegeFeature {
    constructor(Database, accountid) {
        this.Database = Database;
        this.accountid = accountid;
        this.apps = [];
        this.appFeatures = '';
        this.getSupportedAppFeatures();
    }

    async getFrontendPrivileges() {
        let appList = {};
        let apps = await this.fetchApps();
        for (let app of apps) {
            if (app.app === 'afrobuild') {
                appList['afrobuild'] = {
                    tableTitle: PrivilegeAfrobuild.tableTitle,
                    tableName: PrivilegeAfrobuild.tableName,
                    funcName: PrivilegeAfrobuild.funcName,
                    allCheckBox: PrivilegeAfrobuild.allCheckBoxName,
                    icon: PrivilegeAfrobuild.icon,
                    columnList: PrivilegeAfrobuild.columnList
                };
            }
        }
        return appList;
    }

    async updateSingleTable(table, column, columnsValue, category, categoryValue, accountid) {
        const result = await this.checkSinglePrivilegeExistence(table, accountid);
        let queryresult = '';
        if (result.length > 0) {
            queryresult = await this.Database.setupConnection({
                sql: `UPDATE ${table} SET ${column} = ?, ${category} = ? WHERE accountid = ?`,
                columns: [columnsValue, categoryValue, accountid]
            }, 'object');
        } else {
            const privilegeid = gf.getTimeStamp();
            queryresult = await this.Database.setupConnection({
                sql: `INSERT INTO ${table} (privilegeid, accountid, ${column}, ${category}) VALUES(?, ?, ?, ?)`,
                columns: [privilegeid, accountid, columnsValue, categoryValue]
            }, 'object');
        }

        return queryresult.affectedRows ? { affectedRows: queryresult.affectedRows } : { error: queryresult };
    }

    async updateAllTableColumns(table, dataValue, accountid) {
        const privilegeArray = (table === 'privilege_afrobuild') ? PrivilegeAfrobuild.columnList : [];

        for (let col of privilegeArray) {
            const result = await this.checkSinglePrivilegeExistence(table, accountid);
            const query = result.length > 0
                ? {
                    sql: `UPDATE ${table} SET ${col} = ? WHERE accountid = ?`,
                    columns: [dataValue, accountid]
                }
                : {
                    sql: `INSERT INTO ${table} (privilegeid, accountid, ${col}) VALUES(?, ?, ?)`,
                    columns: [gf.getTimeStamp(), accountid, dataValue]
                };

            const queryresult = await this.Database.setupConnection(query, 'object');
            if (queryresult.affectedRows === undefined) console.log(queryresult);
        }

        return { affectedRows: 1 };
    }

    async updateAllExternalTableColumns(table, columns, dataValue, accountid) {
        for (let col of columns) {
            const result = await this.checkSinglePrivilegeExistence(table, accountid);
            const query = result.length > 0
                ? {
                    sql: `UPDATE ${table} SET ${col} = ? WHERE accountid = ?`,
                    columns: [dataValue, accountid]
                }
                : {
                    sql: `INSERT INTO ${table} (privilegeid, accountid, ${col}) VALUES(?, ?, ?)`,
                    columns: [gf.getTimeStamp(), accountid, dataValue]
                };

            const queryresult = await this.Database.setupConnection(query, 'object');
            if (queryresult.affectedRows === undefined) console.log(queryresult);
        }

        return { affectedRows: 1 };
    }

    async insertTable(privilegeid, accountid) {
        const apps = await this.fetchApps();
        let affectedRows = 0;

        for (let app of apps) {
            let sql, columns;
            if (app.app === 'afrobuild') {
                sql = 'INSERT INTO privilege_afrobuild (privilegeid, accountid) VALUES(?, ?)';
                columns = [privilegeid, accountid];
            }

            if (sql && columns) {
                const result = await this.Database.setupConnection({ sql, columns }, 'object');
                if (result?.affectedRows) affectedRows++;
            }
        }

        return { affectedRows };
    }

    async checkSinglePrivilegeExistence(table, accountid) {
        const result = await this.Database.setupConnection({
            sql: `SELECT * FROM ${table} WHERE accountid = ?`,
            columns: [accountid]
        }, 'object');
        return Array.isArray(result) && result.length > 0 ? result : [];
    }

    async getPrivileges() {
        const apps = await this.fetchApps();
        let privilegeData = {};
        let privilegeColumns = {};

        for (let app of apps) {
            if (app.app === 'afrobuild') {
                privilegeData.afrobuild = {};
                const result = await this.fetchPrivilege('privilege_afrobuild');
                const columnsList = PrivilegeAfrobuild.columnList;
                for (let col of columnsList) {
                    privilegeData.afrobuild[col] = result[col];
                    privilegeColumns[col] = result[col];
                }
            }
        }

        return {
            privilegeData,
            privilegeColumns
        };
    }

    async fetchPrivilege(app) {
        try {
            let dataOne = {};
            const result = await this.checkSinglePrivilegeExistence(app, this.accountid);
            if (result.length > 0) {
                let res = await this.Database.setupConnection({
                    sql: `SELECT * FROM ${app} WHERE accountid = ?`,
                    columns: [this.accountid]
                }, 'object');
                dataOne = Array.isArray(res) && res.length > 0 ? res[0] : {};
            } else {
                const privilegeid = gf.getTimeStamp();
                const insert = await this.Database.setupConnection({
                    sql: `INSERT INTO ${app} (privilegeid, accountid) VALUES(?, ?)`,
                    columns: [privilegeid, this.accountid]
                }, 'object');

                if (insert?.affectedRows) {
                    const res = await this.Database.setupConnection({
                        sql: `SELECT * FROM ${app} WHERE accountid = ?`,
                        columns: [this.accountid]
                    }, 'object');
                    dataOne = Array.isArray(res) && res.length > 0 ? res[0] : {};
                }
            }

            let dataTwo = await this.Database.setupConnection({
                sql: `SELECT * FROM ${app} WHERE accountid IN (SELECT groupid FROM user_group WHERE accountid=? AND status=?)`,
                columns: [this.accountid, 'active']
            }, 'object');
            dataTwo = Array.isArray(dataTwo) && dataTwo.length > 0 ? dataTwo[0] : {};

            return CombinePrivilege(dataOne, dataTwo);
        } catch (error) {
            console.error(error);
            return {};
        }
    }


    async getSupportedAppFeatures() {
        const AppsModel = new Apps(this.Database);
        try {
            const result = await AppsModel.preparedFetch({
                sql: 'access = ?',
                columns: ['yes']
            });

            await this.checkToCreateTables(Array.isArray(result) ? result : []);
        } catch (error) {
            console.log('Privilege Feature Model Error => ', error);
        }
    }

    async checkToCreateTables(appFeatures) {
        // You can finish this method depending on your logic
    }

    async fetchApps() {
        const AppsModel = new Apps(this.Database);
        return await AppsModel.preparedFetch({
            sql: 'access = ?',
            columns: ['yes']
        });
    }
}

module.exports = PrivilegeFeature;
