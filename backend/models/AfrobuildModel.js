const PrivilegeAfrobuild = {
    /** 
     * @const {string} tableTitle - Title of table which will be used at the frontend
    */
    tableTitle: 'Afrobuild',

    /** 
     * @const {string} tableName - Key name of or privilege column name
    */
    tableName: 'privilege_afrobuild',

    /** 
     * @const {string} funcName - The value of funcName is used for accessing functionalities. eg. func_admin opens afrobuild sidebar link
    */
    funcName: 'func_admin',

    /** 
     * @const {string} allCheckBoxName - The value of allCheckBoxName is used to turn on and off of the "all" checkbox
    */
    allCheckBoxName: 'afrobuild',

    /** 
     * @const {string} icon - Icon for the fieldset
    */
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-archive"> <polyline points="21 8 21 21 3 21 3 8"></polyline> <rect x="1" y="3" width="22" height="5"></rect> <line x1="10" y1="12" x2="14" y2="12"></line> </svg>',

    /** 
     * @const {Array} columnList - List of columns names for this table
    */
    columnList: [
        'add_privilege', 
        'add_setup', 
        'add_user', 'update_user', 'deactivate_user', 
        'add_department', 'update_department', 'deactivate_department', 
        'add_service', 'update_service', 'deactivate_service', 
        'add_vendor', 'update_vendor', 'deactivate_vendor',
        'add_product', 'update_product', 'deactivate_product',
        'add_role', 'update_role', 'deactivate_role',
        'func_admin', 
        'afrobuild'
    ],

    /** 
     * @const {string} createTableStatement - Create table sql statement as string
    */
    createTableStatement: (`
        privilegeid BIGINT(100) PRIMARY KEY,
        accountid BIGINT(100),
        add_privilege VARCHAR(5),
        add_setup VARCHAR(5),
        add_user VARCHAR(5),
        update_user VARCHAR(5),
        deactivate_user VARCHAR(5),
        add_department VARCHAR(5),
        update_department VARCHAR(5),
        deactivate_department VARCHAR(5),
        add_service VARCHAR(5),
        update_service VARCHAR(5),
        deactivate_service VARCHAR(5),
        add_vendor VARCHAR(5),
        update_vendor VARCHAR(5),
        deactivate_vendor VARCHAR(5),
        add_product VARCHAR(5),
        update_product VARCHAR(5),
        deactivate_product VARCHAR(5),
        add_role VARCHAR(5),
        update_role VARCHAR(5),
        deactivate_role VARCHAR(5),
        func_admin VARCHAR(5),
        afrobuild VARCHAR(5)
    `),

    /** 
     * @const {Array} alterTableStatement - Alter table sql statement as an array. EXAMPLE: ['name-varchar(5)', 'gender-varchar(5)']
    */
    alterTableStatement: ['add_role-varchar(5)', 'update_role-varchar(5)', 'deactivate_role-varchar(5)'],
}

module.exports = PrivilegeAfrobuild;