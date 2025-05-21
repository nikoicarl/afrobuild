const Role = require('../models/RoleModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const SessionActivity = require('../models/SessionModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const gf = new GeneralFunction();

module.exports = function (socket, Database) {
    socket.on('create_role', async (data) => {
        const {
            name, description, role_hiddenid, melody1, melody2
        } = data;

        const session = getSessionIDs(melody1);
        const userid = session.userid;
        const sessionid = session.sessionid;

        // Validate session
        if (md5(userid) !== melody2) {
            return socket.emit(`${melody1}_create_role`, {
                success: false,
                type: 'caution',
                message: 'Session expired. Please refresh and try again.'
            });
        }

        const RoleModel = new Role(Database);
        const PrivilegeModel = new Privilege(Database, userid);
        const SessionActivityModel = new SessionActivity(Database);

        const isNewRole = !role_hiddenid || role_hiddenid.trim() === '';
        const requiredFields = isNewRole ? [name] : [name];

        // Check for empty fields
        const checkEmpty = gf.ifEmpty(requiredFields);
        if (checkEmpty.includes('empty')) {
            return socket.emit(`${melody1}_create_role`, {
                success: false,
                message: 'Please fill in all required fields.'
            });
        }

        try {
            const privilegeData = (await PrivilegeModel.getPrivileges()).privilegeData;
            const privilege = isNewRole
                ? privilegeData?.afrobuild?.add_role
                : privilegeData?.afrobuild?.update_role;

            if (privilege !== 'yes') {
                return socket.emit(`${melody1}_create_role`, {
                    success: false,
                    type: 'caution',
                    message: 'You do not have the required privilege.'
                });
            }

            // Ensure role name is unique (excluding self if updating)
            const checkRole = await RoleModel.preparedFetch({
                sql: 'name = ? AND roleid != ?',
                columns: [name, isNewRole ? 0 : role_hiddenid]
            });

            if (Array.isArray(checkRole) && checkRole.length > 0) {
                return socket.emit(`${melody1}_create_role`, {
                    success: false,
                    message: 'Role name is already taken.'
                });
            }

            const newRoleId = isNewRole ? gf.getTimeStamp() : role_hiddenid;

            const result = isNewRole
                ? await RoleModel.insertTable([
                    newRoleId, name, description, gf.getDateTime(), 'active'
                ])
                : await RoleModel.updateTable({
                    sql: `
                        name = ?, description = ? WHERE roleid = ?
                    `,
                    columns: [name, description, newRoleId]
                });

            if (result?.affectedRows > 0) {
                // Record session activity
                const activityId = gf.getTimeStamp();
                const activityMessage = isNewRole ? 'Added new role' : 'Updated role';

                await SessionActivityModel.insertTable([
                    activityId,
                    sessionid,
                    activityMessage,
                    gf.getDateTime(),
                    null // logout field remains null
                ]);

                return socket.emit(`${melody1}_create_role`, {
                    success: true,
                    message: isNewRole
                        ? 'New role created successfully.'
                        : 'Role updated successfully.'
                });
            } else {
                return socket.emit(`${melody1}_create_role`, {
                    success: false,
                    message: 'No changes were made.'
                });
            }

        } catch (err) {
            console.error('Error in create_role:', err);
            return socket.emit(`${melody1}_create_role`, {
                success: false,
                message: 'Internal server error: ' + err.message
            });
        }
    });
};
