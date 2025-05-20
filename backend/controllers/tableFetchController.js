const User = require('../models/UserModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const gf = new GeneralFunction();

module.exports = (socket, Database) => {
    socket.on('table', async (browserblob) => {
        const param = browserblob.param;
        const melody1 = browserblob.melody1 || '';

        if (param !== 'user_table') return;

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

            const hasUserPermission = ['add_user', 'update_user', 'deactivate_user'].some(
                perm => afrobuildPerms[perm] === 'yes'
            );

            if (!hasUserPermission) {
                return socket.emit(`${melody1}_${param}`, []);
            }

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

            // Emit raw users data without mapping
            socket.emit(`${melody1}_${param}`, users);

        } catch (err) {
            socket.emit(`${melody1}_${param}`, {
                type: 'error',
                message: err.message || 'An error occurred while fetching user data.'
            });
        }
    });
};
