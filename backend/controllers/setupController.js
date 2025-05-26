const Setup = require('../models/SetupModel');
const User = require('../models/UserModel');
const Session = require('../models/SessionModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const Apps = require('../models/AppsModel');
const md5 = require('md5');

const gf = new GeneralFunction();

module.exports = (socket, Database) => {
    socket.on('businessSetup', async (browserblob) => {
        const { name, email, mobile, address, country, region } = browserblob;

        const AppsModel = new Apps(Database);
        const SetupModel = new Setup(Database);
        const UserModel = new User(Database);
        const SessionModel = new Session(Database);

        try {
            const validationStatus = gf.ifEmpty([name, email, mobile, address, country, region]);
            if (validationStatus.includes('empty')) {
                return socket.emit('_businessSetup', {
                    type: 'caution',
                    message: 'Some fields are required',
                });
            }

            const appCheck = await AppsModel.preparedFetch({ sql: '1', columns: [] });
            if (!appCheck.length) {
                await AppsModel.insertTable([gf.getTimeStamp(), 'afrobuild', 'yes']);
            }

            const setupResult = await SetupModel.preparedFetch({ sql: '1', columns: [] });

            if (Array.isArray(setupResult) && setupResult.length > 0) {
                // Update existing setup
                await SetupModel.updateTable({
                    sql: 'name=?, email=?, phone=?, address=?, country=?, state_region=? WHERE 1',
                    columns: [name, email, mobile, address, country, region],
                });

                await UserModel.updateTable({
                    sql: 'username=?, password=?, status=?, date_time=? WHERE 1',
                    columns: ['admin', md5('admin123'), 'active', gf.getDateTime()],
                });

                const userFetch = await UserModel.preparedFetch({ sql: '1', columns: [] });
                const userid = userFetch?.[0]?.userid;
                if (!userid) throw new Error('User ID not found');

                const PrivilegeModel = new Privilege(Database, userid);
                const privileges = await PrivilegeModel.getPrivileges();

                if (!privileges.privilegeData?.afrobuild?.add_privilege) {
                    const privilegeid = gf.getTimeStamp();
                    await PrivilegeModel.insertTable(privilegeid, userid, 'admin');
                } else {
                    await PrivilegeModel.updateSingleTable('afrobuild', 'add_privilege', 'yes', 'add_setup', 'yes', userid);
                }

                // Set all privileges to 'yes'
                await PrivilegeModel.setAllPrivilegesToYes(userid);

                const sessionid = gf.getTimeStamp();
                await SessionModel.insertTable([
                    sessionid, userid, 'Business Setup', gf.getDateTime(), null,
                ]);

                const token = gf.shuffle("qwertyuiopasdfghjklzxcvbnm");
                const melody1 = (token.slice(0, 4) + userid + token.slice(5, 7) + '-' + token.slice(7, 9) + sessionid + token.slice(10, 14)).toUpperCase();

                return socket.emit('_businessSetup', {
                    type: 'success',
                    message: 'Account has been set up successfully, redirecting...',
                    melody1,
                    melody2: md5(userid),
                });

            } else {
                // Insert new setup
                const setupid = gf.getTimeStamp();
                const sessionid = gf.getTimeStamp();
                const userid = gf.getTimeStamp();

                const insertSetupResult = await SetupModel.insertTable([
                    setupid, name, email, mobile, address, country, region, 'active',
                    gf.getDateTime(), sessionid,
                ]);

                if (!insertSetupResult.affectedRows) throw new Error('Failed to insert setup');

                const insertUserResult = await UserModel.insertTable([
                    userid, 'system', 'administrator', null, null, null,
                    'admin', md5('admin123'), 'active', gf.getDateTime(), null,
                ]);

                if (!insertUserResult.affectedRows) throw new Error('Failed to insert user');

                const PrivilegeModel = new Privilege(Database, userid);
                const privileges = await PrivilegeModel.getPrivileges();

                if (!privileges.privilegeData?.afrobuild?.add_privilege) {
                    const privilegeid = gf.getTimeStamp();
                    await PrivilegeModel.insertTable(privilegeid, userid, 'admin');
                } else {
                    await PrivilegeModel.updateSingleTable('privilege_afrobuild', 'add_privilege', 'yes', 'add_setup', 'yes', userid);
                }

                // Set all privileges to 'yes'
                await PrivilegeModel.setAllPrivilegesToYes(userid);

                await SessionModel.insertTable([sessionid, userid, 'business setup', gf.getDateTime(), null]);

                const token = gf.shuffle("qwertyuiopasdfghjklzxcvbnm");
                const melody1 = (token.slice(0, 4) + userid + token.slice(5, 7) + '-' + token.slice(7, 9) + sessionid + token.slice(10, 14)).toUpperCase();

                return socket.emit('_businessSetup', {
                    type: 'success',
                    message: 'Account has been set up successfully, redirecting...',
                    melody1,
                    melody2: md5(userid),
                });
            }

        } catch (error) {
            console.error('Account Setup Error:', error);
            return socket.emit('_businessSetup', {
                type: 'error',
                message: error.message || 'Unexpected error occurred',
            });
        }
    });
};
