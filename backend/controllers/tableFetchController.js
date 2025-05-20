const User = require('../models/UserModel');
const Role = require('../models/RoleModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const gf = new GeneralFunction();

module.exports = (socket, Database) => {
    socket.on('table', async (browserblob) => {
        const param = browserblob.param;
        const melody1 = browserblob.melody1 || '';

        // Check if param is neither user_table nor role_table
        if (param !== 'user_table' && param !== 'role_table') return;

        try {
            const session = getSessionIDs(melody1);
            if (!session || !session.userid) {
                return socket.emit(`${melody1}_${param}`, {
                    type: 'error',
                    message: 'Invalid session.'
                });
            }

            const userid = session.userid;
            const PrivilegeModel = new Privilege(Database, userid);
            const privilegeData = (await PrivilegeModel.getPrivileges()).privilegeData || {};
            const afrobuildPerms = privilegeData.afrobuild || {};

            // Check permissions and handle fetching for user_table and role_table
            if (param === 'user_table') {
                const hasUserPermission = ['add_user', 'update_user', 'deactivate_user'].some(
                    perm => afrobuildPerms[perm] === 'yes'
                );

                if (!hasUserPermission) {
                    return socket.emit(`${melody1}_${param}`, []);
                }

                // Fetch user data using preparedFetch
                const UserModel = new User(Database);
                const users = await UserModel.preparedFetch({
                    sql: 'status != ? ORDER BY date_time DESC',
                    columns: ['inactive']
                });

                if (!Array.isArray(users)) {
                    return socket.emit(`${melody1}_${param}`, {
                        type: 'error',
                        message: 'Database error while fetching users.'
                    });
                }

                // Emit raw users data
                return socket.emit(`${melody1}_${param}`, users);
            }

            if (param === 'role_table') {
                const hasRolePermission = ['add_role', 'update_role', 'deactivate_role'].some(
                    perm => afrobuildPerms[perm] === 'yes'
                );

                if (!hasRolePermission) {
                    return socket.emit(`${melody1}_${param}`, []);
                }

                // Fetch role data using preparedFetch
                const RoleModel = new Role(Database);  // Assuming Role is a table in your DB
                const roles = await RoleModel.preparedFetch({
                    sql: 'status != ? ORDER BY name ASC',  // Adjust SQL query as needed
                    columns: ['inactive']
                });

                if (!Array.isArray(roles)) {
                    return socket.emit(`${melody1}_${param}`, {
                        type: 'error',
                        message: 'Database error while fetching roles.'
                    });
                }

                // Emit raw roles data
                return socket.emit(`${melody1}_${param}`, roles);
            }

        } catch (err) {
            socket.emit(`${melody1}_${param}`, {
                type: 'error',
                message: err.message || 'An error occurred while fetching data.'
            });
        }
    });
};
