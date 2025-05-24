const CreateUpdateModel = require('./CreateUpdateModel');
const Apps = require('./AppsModel');
const CombinePrivilege = require('./CombinePrivilegeModel');
const GeneralFunction = require('./GeneralFunctionModel');
const gf = new GeneralFunction();

const PrivilegeAfrobuild = require('../models/AfrobuildModel');

class PrivilegeFeature {
    /**
     * Constructor of this class
     * @param {object} Database - A database connection object that will allows connection to the database.
     * @param {number} accountid - An account id in which queries will be performed on.
     */
    constructor(Database, accountid) {
        this.Database = Database;

        this.accountid = accountid;

        this.apps = [];

        this.appFeatures = '';

        this.getSupportedAppFeatures();
    }

    /**
     * A method that fetches for categorized app supported by business for frontend display.
     */
    async getFrontendPrivileges() {
        let appList = {};
        let apps = await this.fetchApps();
        if (apps.length > 0) {
            for (let i = 0; i < apps.length; i++) {
                const app = apps[i];
                if (app.app == 'afrobuild') {
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
        }

        return appList;
    }

    /**
     * A method to run an update query for a single column
     * @param {string} table - Privilege table of which this query should be executed on.
     * @param {string} column - The column of which the it value should be updated.
     * @param {string} columnsValue - The value of the first column.
     * @param {string} category - The column of which the it value should be updated.
     * @param {string} categoryValue - The value of the first column.
     * @param {number} accountid - An account id in which queries will be performed on.
     */
    async updateSingleTable(table, column, columnsValue, category, categoryValue, accountid) {
        let result = await this.checkSinglePrivilegeExistence(table, accountid);
        let queryresult = '';
        if (result.length > 0) {
            queryresult = await this.Database.setupConnection({
                sql: 'UPDATE ' + table + ' SET ' + column + ' = ?, ' + category + ' = ? WHERE accountid = ?',
                columns: [columnsValue, categoryValue, accountid]
            }, 'object');
        } else {
            let privilegeid = gf.getTimeStamp();
            queryresult = await this.Database.setupConnection({
                sql: 'INSERT INTO ' + table + ' (privilegeid, accountid, ' + column + ', ' + category + ') VALUES(?, ?, ?, ?)',
                columns: [privilegeid, accountid, columnsValue, categoryValue]
            }, 'object');
        }
        if (queryresult.affectedRows) {
            return { affectedRows: queryresult.affectedRows };
        } else {
            return { error: queryresult };
        }
    }

    /**
     * A method to run an update query for a all columns
     * @param {string} table - Privilege table of which this query should be executed on.
     * @param {string} dataValue - The constant value which are: yes||no to update the looped columns.
     * @param {number} accountid - An account id in which queries will be performed on.
     */
    async updateAllTableColumns(table, dataValue, accountid) {
        let privilegeArray = [], sql;
        if (table == 'privilege_afrobuild') {
            privilegeArray = PrivilegeAfrobuild.columnList;

        }

        for (let i = 0; i < privilegeArray.length; i++) {
            let result = await this.checkSinglePrivilegeExistence(table, accountid);
            let queryresult = '';
            if (result.length > 0) {
                queryresult = await this.Database.setupConnection({
                    sql: 'UPDATE ' + table + ' SET ' + privilegeArray[i] + ' = ? WHERE accountid = ?',
                    columns: [dataValue, accountid]
                }, 'object');
            } else {
                let privilegeid = gf.getTimeStamp();
                queryresult = await this.Database.setupConnection({
                    sql: 'INSERT INTO ' + table + ' (privilegeid, accountid, ' + privilegeArray[i] + ') VALUES(?, ?, ?)',
                    columns: [privilegeid, accountid, dataValue]
                }, 'object');
            }
            queryresult.affectedRows != undefined ? '' : console.log(queryresult);
        }
        return {
            affectedRows: 1
        }
    }

    /**
     * A method to run an update query for a all columns
     * @param {string} table - Privilege table of which this query should be executed on.
     * @param {array} columns - Columns array contains all columns for a particular app in the privileges. 
     * @param {string} dataValue - The constant value which are: yes||no to update the looped columns.
     * @param {number} accountid - An account id in which queries will be performed on.
     */
    async updateAllExternalTableColumns(table, columns, dataValue, accountid) {
        let sql;
        for (let i = 0; i < columns.length; i++) {
            let result = await this.checkSinglePrivilegeExistence(table, accountid);
            let queryresult = '';
            if (result.length > 0) {
                queryresult = await this.Database.setupConnection({
                    sql: 'UPDATE ' + table + ' SET ' + columns[i] + ' = ? WHERE accountid = ?',
                    columns: [dataValue, accountid]
                }, 'object');
            } else {
                let privilegeid = gf.getTimeStamp();
                queryresult = await this.Database.setupConnection({
                    sql: 'INSERT INTO ' + table + ' (privilegeid, accountid, ' + columns[i] + ') VALUES(?, ?, ?)',
                    columns: [privilegeid, accountid, dataValue]
                }, 'object');
            }
            queryresult.affectedRows != undefined ? '' : console.log(queryresult);
        }
        return {
            affectedRows: 1
        }
    }

    /**
     * A method to run an insert query for a all related tables and columns
     * @param {number} privilegeid - A pre generated privilege ID.
     * @param {number} accountid - An account id in which queries will be performed on.
     */
    async insertTable(privilegeid, accountid, checker) {
        let apps = await this.fetchApps();
        try {
            let affectedRows = 0;
            if (apps.length > 0) {
                for (let i = 0; i < apps.length; i++) {
                    const app = apps[i];
                    let sql, columns;
                    if (app.app == 'afrobuild') {
                        sql = 'INSERT INTO privilege_afrobuild (privilegeid, accountid) VALUES(?, ?)';
                        columns = [privilegeid, accountid];
                    }

                    if (sql !== undefined && columns !== undefined) {
                        let result = await this.Database.setupConnection({
                            sql: sql,
                            columns: columns
                        }, 'object');
                        if (result && result.affectedRows) {
                            affectedRows++;
                        }
                    }
                }
                return {
                    affectedRows: affectedRows
                };
            } else {
                return {
                    affectedRows: affectedRows
                };
            }
        } catch (error) {
            console.log('Inserting into privilege error: ', error)
            return error;
        }
    }

    /**
     * A method to check if userid exist in database
     * @param {string} table - Table name in which query should be run on
     * @param {number} accountid - Userid for the checking
     */
    async checkSinglePrivilegeExistence(table, accountid) {
        let result = await this.Database.setupConnection({
            sql: 'SELECT * FROM ' + table + ' WHERE accountid = ?',
            columns: [accountid]
        }, 'object');
        return (Array.isArray(result) && result.length > 0) ? result : [];
    }

    async getPrivileges() {
        const apps = await this.fetchApps();
        let privilegeData = {};
        let privilegeColumns = {};
        if (apps.length > 0) {
            for (let i = 0; i < apps.length; i++) {
                const app = apps[i];
                if (app.app == 'afrobuild') {
                    privilegeData['afrobuild'] = {};
                    let result = await this.fetchPrivilege('privilege_afrobuild');
                    let columnsList = PrivilegeAfrobuild.columnList;
                    if (columnsList.length > 0) {
                        for (let i = 0; i < columnsList.length; i++) {
                            const column = columnsList[i];
                            privilegeData.afrobuild[column] = result[column];
                            privilegeColumns[column] = result[column];
                        }
                    }
                }
            }
        }

        return {
            privilegeData: privilegeData,
            privilegeColumns: privilegeColumns
        };
    }

    async fetchPrivilege(app) {
        try {
            let dataOne;
            let result = await this.checkSinglePrivilegeExistence(app, this.accountid);
            if (result.length > 0) {
                dataOne = await this.Database.setupConnection({
                    sql: 'SELECT * FROM ' + app + ' WHERE accountid = ?',
                    columns: [this.accountid]
                }, 'object');
                dataOne = Array.isArray(dataOne) && dataOne.length > 0 ? dataOne[0] : {};
            } else {
                let privilegeid = gf.getTimeStamp();
                let queryresult = await this.Database.setupConnection({
                    sql: 'INSERT INTO ' + app + ' (privilegeid, accountid) VALUES(?, ?)',
                    columns: [privilegeid, this.accountid]
                }, 'object');
                if (queryresult && queryresult.affectedRows != undefined) {
                    dataOne = await this.Database.setupConnection({
                        sql: 'SELECT * FROM ' + app + ' WHERE accountid = ?',
                        columns: [this.accountid]
                    }, 'object');
                    dataOne = Array.isArray(dataOne) && dataOne.length > 0 ? dataOne[0] : {};
                } else {
                    dataOne = {};
                }
            }

            let dataTwo = await this.Database.setupConnection({
                sql: 'SELECT * FROM ' + app + ' WHERE accountid IN (SELECT groupid FROM user_group WHERE accountid=? AND status=?)',
                columns: [this.accountid, 'active']
            }, 'object');
            dataTwo = Array.isArray(dataTwo) && dataTwo.length > 0 ? dataTwo[0] : {};

            let privilegeData = CombinePrivilege(dataOne, dataTwo);

            return privilegeData;
        } catch (error) {
            console.log(error);
            return {};
        }
    }

    /**
     * A function to check the existense of tables (Privilege tables).
     */
    async getSupportedAppFeatures() {
        const AppsModel = new Apps(this.Database);

        try {
            let result = await AppsModel.preparedFetch({
                sql: 'access = ?',
                columns: ['yes']
            });
            result = Array.isArray(result) ? result : [];
            await this.checkToCreateTables(result);
            return false;
        } catch (error) {
            console.log('Privilege Feature Model Error => ', error);
        }
    }

    async checkToCreateTables(appFeatures) {
        let apps = []
        if (Array.isArray(appFeatures) && appFeatures.length > 0) {
            for (let i = 0; i < appFeatures.length; i++) {
                const app = appFeatures[i];
                if (apps.includes(app.app)) { } else {
                    apps.push(app.app);
                }
            }
        }
        await this.loopToCreateTables(apps);
        return false;
    }

    async loopToCreateTables(apps) {
        if (apps.length > 0) {
            for (let i = 0; i < apps.length; i++) {
                const app = apps[i];
                let statement;

                if (app == 'afrobuild') {
                    statement = {
                        tableName: PrivilegeAfrobuild.tableName,
                        createTableStatement: PrivilegeAfrobuild.createTableStatement,
                        foreignKeyStatement: '',
                        alterTableStatement: PrivilegeAfrobuild.alterTableStatement
                    }
                } else {
                    statement = {
                        tableName: '',
                        createTableStatement: '',
                        foreignKeyStatement: '',
                        alterTableStatement: ''
                    }
                }

                const CreateUpdateTable = new CreateUpdateModel(this.Database, statement);
                await CreateUpdateTable.checkTableExistence();
            }
        }
    }

    /**
     * A function to fetch for apps.
     */
    async fetchApps() {
        const AppsModel = new Apps(this.Database);
        try {
            let result = await AppsModel.preparedFetch({
                sql: 'access = ?',
                columns: ['yes']
            });
            result = Array.isArray(result) ? result : [];
            return result;
        } catch (error) {
            console.log('Privilege Feature Model Error2 => ', error);
        }
    }

    /**
 * Set all privileges to 'yes' for the provided accountid across all apps.
 * @param {String} accountid - The ID of the account to update privileges for.
 */
async setAllPrivilegesToYes(accountid) {
    const apps = await this.fetchApps();
    let affectedRows = 0;

    for (let i = 0; i < apps.length; i++) {
        const app = apps[i];
        let table = '';
        let columnList = [];

        if (app.app === 'afrobuild') {
            table = 'privilege_afrobuild';
            columnList = PrivilegeAfrobuild.columnList;
        }

        if (table && columnList.length > 0) {
            const result = await this.updateAllExternalTableColumns(table, columnList, 'yes', accountid);
            if (result.affectedRows) {
                affectedRows += result.affectedRows;
            }
        }
    }

    return {
        message: 'All privileges have been set to yes.',
        totalAffected: affectedRows
    };
}



} //End of class

module.exports = PrivilegeFeature;