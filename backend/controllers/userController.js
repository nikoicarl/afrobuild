const User = require('../models/UserModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const SessionActivity = require('../models/SessionModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const gf = new GeneralFunction();

module.exports = function (socket, Database) {
    socket.on('create_user', async (data) => {
        const {
            first_name, last_name, email, phone, address,
            username, password, confirm_password,
            user_hiddenid, melody1, melody2
        } = data;

        const session = getSessionIDs(melody1);
        const userid = session.userid;
        const sessionid = session.sessionid;

        // Validate session
        if (md5(userid) !== melody2) {
            return socket.emit(`${melody1}_create_user`, {
                success: false,
                type: 'caution',
                message: 'Session expired. Please refresh and try again.'
            });
        }

        const UserModel = new User(Database);
        const PrivilegeModel = new Privilege(Database, userid);
        const SessionActivityModel = new SessionActivity(Database);

        const isNewUser = !user_hiddenid || user_hiddenid.trim() === '';
        const requiredFields = isNewUser
            ? [first_name, last_name, email, phone, address, username, password, confirm_password]
            : [first_name, last_name, email, phone, address, username];

        // Check for empty fields
        const checkEmpty = gf.ifEmpty(requiredFields);
        if (checkEmpty.includes('empty')) {
            return socket.emit(`${melody1}_create_user`, {
                success: false,
                message: 'Please fill in all required fields.'
            });
        }

        try {
            const privilegeData = (await PrivilegeModel.getPrivileges()).privilegeData;
            const privilege = isNewUser
                ? privilegeData?.afrobuild?.add_user
                : privilegeData?.afrobuild?.update_user;


            if (privilege !== 'yes') {
                return socket.emit(`${melody1}_create_user`, {
                    success: false,
                    type: 'caution',
                    message: 'You do not have the required privilege.'
                });
            }

            // Ensure username is unique (excluding self if updating)
            const checkUser = await UserModel.preparedFetch({
                sql: 'username = ? AND userid != ?',
                columns: [username, isNewUser ? 0 : user_hiddenid]
            });

            if (Array.isArray(checkUser) && checkUser.length > 0) {
                return socket.emit(`${melody1}_create_user`, {
                    success: false,
                    message: 'Username is already taken.'
                });
            }

            // Password validation
            if (isNewUser || password) {
                if (password !== confirm_password) {
                    return socket.emit(`${melody1}_create_user`, {
                        success: false,
                        message: 'Passwords do not match.'
                    });
                }
            }

            const newUserId = isNewUser ? gf.getTimeStamp() : user_hiddenid;
            const hashedPassword = password ? md5(password) : null;

            const result = isNewUser
                ? await UserModel.insertTable([
                    newUserId, first_name, last_name, phone, email, address,
                    username, hashedPassword, null, 'active', gf.getDateTime(), userid
                ])
                : await UserModel.updateTable({
                    sql: `
                        first_name = ?, last_name = ?, phone = ?, email = ?, address = ?, 
                        username = ?${password ? ', password = ?' : ''} 
                        WHERE userid = ? AND status = ?
                    `,
                    columns: password
                        ? [first_name, last_name, phone, email, address, username, hashedPassword, newUserId, 'active']
                        : [first_name, last_name, phone, email, address, username, newUserId, 'active']
                });

            if (result?.affectedRows > 0) {
                // Record session activity
                const activityId = gf.getTimeStamp();
                const activityMessage = isNewUser ? 'Added user account' : 'Updated user account';

                await SessionActivityModel.insertTable([
                    activityId,
                    userid,
                    activityMessage,
                    gf.getDateTime(),
                    null // logout field remains null
                ]);

                return socket.emit(`${melody1}_create_user`, {
                    success: true,
                    message: isNewUser
                        ? 'New user created successfully.'
                        : 'User updated successfully.'
                });
            } else {
                return socket.emit(`${melody1}_create_user`, {
                    success: false,
                    message: 'No changes were made.'
                });
            }

        } catch (err) {
            console.error('Error in create_user:', err);
            return socket.emit(`${melody1}_create_user`, {
                success: false,
                message: 'Internal server error: ' + err.message
            });
        }
    });
};
