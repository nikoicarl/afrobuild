const User = require('../models/UserModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const gf = new GeneralFunction();

module.exports = (socket, Database) => {
    socket.on('deactivate', async (browserblob) => {
        const { param, melody1, dataId, checker } = browserblob;
        console.log(browserblob);
        
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
                // Check user privilege for deactivating
                if (privilegeData?.afrobuild.deactivate_user === "yes") {
                    const status = checker === "deactivate" ? 'deactivated' : 'active';
                    const UserModel = new User(Database);

                    // Update user status
                    result = await UserModel.updateTable({
                        sql: 'status=? WHERE userid=?',
                        columns: [status, dataId]
                    });
                } else {
                    message = 'You do not have the required privileges to perform this task.';
                }
            }

            // Default message if no custom message was set
            if (!message) {
                message = result?.affectedRows
                    ? 'User status updated successfully.'
                    : 'Failed to update user status.';
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
