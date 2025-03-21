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
        'view_account_chart', 'create_task', 
        'add_service', 'update_service', 'deactivate_service', 
        'add_group', 'update_group', 'deactivate_group', 
        'assign_user_to_group', 
        'add_privilege', 
        'add_setup', 
        'add_user', 'update_user', 'deactivate_user', 
        'add_department', 'update_department', 'deactivate_department', 
        'add_employee', 'update_employee', 'deactivate_employee', 
        'add_role', 'update_role', 'deactivate_role', 
        'add_bank', 'update_bank', 'deactivate_bank', 
        'add_employment_status', 'update_employment_status', 'deactivate_employment_status', 
        'add_petty_cash', 'update_petty_cash', 'deactivate_petty_cash',
        'add_correspondence', 'update_correspondence', 'deactivate_correspondence', 
        'allow_external_connection', 
        'func_admin', 
        'afrobuild'
    ],

    /** 
     * @const {string} createTableStatement - Create table sql statement as string
    */
    createTableStatement: (`
        privilegeid BIGINT(100) PRIMARY KEY,
        accountid BIGINT(100),
        view_account_chart varchar(5),
        create_task varchar(5),
        add_service varchar(5),
        update_service varchar(5),
        deactivate_service varchar(5),
        add_group varchar(5),
        update_group varchar(5),
        deactivate_group varchar(5),
        assign_user_to_group varchar(5),
        add_privilege varchar(5),
        add_setup varchar(5),
        add_user varchar(5),
        update_user varchar(5),
        deactivate_user varchar(5),
        add_department varchar(5),
        update_department varchar(5),
        deactivate_department varchar(5),
        add_employee varchar(5),
        update_employee varchar(5),
        deactivate_employee varchar(5),
        add_role varchar(5),
        update_role varchar(5),
        deactivate_role varchar(5),
        add_bank varchar(5),
        update_bank varchar(5),
        deactivate_bank varchar(5),
        add_employment_status varchar(5),
        update_employment_status varchar(5),
        deactivate_employment_status varchar(5),
        add_petty_cash varchar(5),
        update_petty_cash varchar(5),
        deactivate_petty_cash varchar(5),
        add_correspondence varchar(5),
        update_correspondence varchar(5),
        deactivate_correspondence varchar(5),
        allow_external_connection varchar(5),
        func_admin varchar(5),
        afrobuild varchar(5)
    `),

    /** 
     * @const {Array} alterTableStatement - Alter table sql statement as an array. EXAMPLE: ['name-varchar(5)', 'gender-varchar(5)']
    */
    alterTableStatement: [
        'create_task-varchar(5)', 
        'allow_external_connection-varchar(5)'
    ],
}

module.exports = PrivilegeAfrobuild;