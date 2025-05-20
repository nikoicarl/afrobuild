const User = require('../models/UserModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const RoleModel = require('../models/RoleModel');  // Import RoleModel
const GeneralFunction = require('../models/GeneralFunctionModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const gf = new GeneralFunction();

module.exports = (socket, Database) => {
    socket.on('deactivate', async (browserblob) => {
        const { param, melody1, dataId, checker } = browserblob;

        if (!param) {
            return socket.emit(`${melody1}_${param}`, {
                type: 'error',
                message: 'Invalid parameters provided.'
            });
        }

        const session = getSessionIDs(melody1);
        const { userid, sessionid } = session;

        try {
            const PrivilegeModel = new Privilege(Database, userid);
            const { privilegeData } = await PrivilegeModel.getPrivileges();

            let message = '';
            let result = null;

            if (param === "deactivate_user") {
                // Check user privilege for deactivating user
                if (privilegeData?.afrobuild.deactivate_user === "yes") {
                    const status = checker === "deactivate" ? 'deactivated' : 'active';
                    const UserModel = new User(Database);

                    // Update user status
                    result = await UserModel.updateTable({
                        sql: 'status=? WHERE userid=?',
                        columns: [status, dataId]
                    });
                    message = result?.affectedRows
                        ? 'User status updated successfully.'
                        : 'Failed to update user status.';
                } else {
                    message = 'You do not have the required privileges to perform this task.';
                }
            } else if (param === "deactivate_role") {
                // Check user privilege for deactivating roles
                if (privilegeData?.afrobuild.deactivate_role === "yes") {
                    const roleStatus = checker === "deactivate" ? 'inactive' : 'active';
                    const RoleModelInstance = new RoleModel(Database);

                    // Update role status using RoleModel
                    result = await RoleModelInstance.updateRoleStatus({
                        sql: 'role_status=? WHERE userid=?',
                        columns: [roleStatus, dataId]
                    });
                    message = result?.affectedRows
                        ? 'Role status updated successfully.'
                        : 'Failed to update role status.';
                } else {
                    message = 'You do not have the required privileges to deactivate roles.';
                }
            } else {
                message = 'Invalid parameter provided.';
            }

            // Emit the response based on result
            socket.emit(`${melody1}_${param}`, {
                type: result?.affectedRows ? 'success' : 'caution',
                message: message
            });

        } catch (error) {
            // Log the error for debugging purposes (optional)
            console.error('Error in deactivate:', error);

            socket.emit(`${melody1}_${param}`, {
                type: 'error',
                message: 'An unexpected error occurred. Please try again later.'
            });
        }
    });
};
