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
            // Validate input fields
            const validationStatus = gf.ifEmpty([name, email, mobile, address, country, region]);
            if (validationStatus.includes('empty')) {
                return socket.emit('_businessSetup', {
                    type: 'caution',
                    message: 'Some fields are required',
                });
            }

            // Ensure 'afrobuild' app is registered
            const appCheck = await AppsModel.preparedFetch({
                sql: '1',
                columns: [],
            });

            if (!appCheck.length) {
                await AppsModel.insertTable([gf.getTimeStamp(), 'afrobuild', 'yes']);
            }

            // Check for existing setup
            const setupResult = await SetupModel.preparedFetch({
                sql: '1',
                columns: [],
            });

            if (Array.isArray(setupResult) && setupResult.length > 0) {
                // Update existing setup
                const updateResult = await SetupModel.updateTable({
                    sql: 'name=?, email=?, phone=?, address=?, country=?, state_region=? WHERE 1',
                    columns: [name, email, mobile, address, country, region],
                });

                if (updateResult.affectedRows) {
                    // Update the 'admin' user credentials
                    await UserModel.updateTable({
                        sql: 'username=?, password=?, status=?, date_time=? WHERE 1',
                        columns: ['admin', md5('admin123'), 'active', gf.getDateTime()],
                    });

                    // Fetch the user data
                    const userFetch = await UserModel.preparedFetch({
                        sql: '1',
                        columns: [],
                    });

                    const userid = userFetch?.[0]?.userid;
                    if (!userid) throw new Error('User ID not found');

                    // Ensure privileges are set up for the user
                    const PrivilegeModelWithUser = new Privilege(Database, userid);
                    const privileges = await PrivilegeModelWithUser.getPrivileges();

                    if (!privileges.privilegeData?.administration?.add_privilege) {
                        const privilegeid = gf.getTimeStamp();
                        await PrivilegeModelWithUser.insertTable(privilegeid, userid, 'admin');
                    } else {
                        await PrivilegeModelWithUser.updateSingleTable(
                            'administration', 'add_privilege', 'yes', 'add_setup', 'yes', userid
                        );
                    }

                    // Insert session
                    const sessionid = gf.getTimeStamp();
                    const sessionResult = await SessionModel.insertTable([
                        sessionid, gf.getDateTime(), null, userid, 'active',
                    ]);

                    if (sessionResult.affectedRows) {
                        const token = gf.shuffle("qwertyuiopasdfghjklzxcvbnm");
                        const melody1 = (token.slice(0, 4) + userid + token.slice(5, 7) + '-' + token.slice(7, 9) + sessionid + token.slice(10, 14)).toUpperCase();

                        socket.emit('_businessSetup', {
                            type: 'success',
                            message: 'Account has been set up successfully, redirecting...',
                            melody1,
                            melody2: md5(userid),
                        });
                    }
                }
            } else {
                // Insert new setup
                const setupid = gf.getTimeStamp();
                const sessionid = gf.getTimeStamp();
                const userid = gf.getTimeStamp();

                const insertSetupResult = await SetupModel.insertTable([
                    setupid, name, email, mobile, address, country, region, 'active',
                    gf.getDateTime(), sessionid,
                ]);

                if (insertSetupResult.affectedRows) {
                    const insertUserResult = await UserModel.insertTable([userid, 'admin', null, null, null, null, 'admin', md5('admin123'), 'active', gf.getDateTime(), null]);

                    if (insertUserResult.affectedRows) {
                        //Get user details
                        result = await UserModel.preparedFetch({
                            sql: '1',
                            columns: []
                        });

                        let userid = result.length > 0 ? result[0].userid : userid;
                        const PrivilegeModel = new Privilege(Database, userid);
                        
                        //Get privilege data
                        let privilegeData = (await PrivilegeModel.getPrivileges()).privilegeData;

                        
                        if (privilegeData.afrobuild.add_privilege != undefined || privilegeData.afrobuild.add_privilege != 'no' || privilegeData.afrobuild.add_privilege != null || privilegeData.afrobuild.add_privilege != '' || privilegeData.afrobuild.add_privilege != ' ') {
                            //Update Privilege
                            privilegeResult = await PrivilegeModel.updateSingleTable('privilege_afrobuild', 'add_privilege', 'yes', 'add_setup', 'yes', userid);
                        } else {
                            //Insert Into Privilege
                            let privilegeid = gf.getTimeStamp();
                            privilegeResult = await PrivilegeModel.insertTable(privilegeid, userid, 'admin');
                        }

                        if (privilegeResult.affectedRows) {
                            const sessionResult = await SessionModel.insertTable([sessionid, userid, 'business setup', gf.getDateTime()]);

                            if (sessionResult.affectedRows) {
                                const token = gf.shuffle("qwertyuiopasdfghjklzxcvbnm");
                                const melody1 = (token.slice(0, 4) + userid + token.slice(5, 7) + '-' + token.slice(7, 9) + sessionid + token.slice(10, 14)).toUpperCase();

                                socket.emit('_businessSetup', {
                                    type: 'success',
                                    message: 'Account has been set up successfully, redirecting...',
                                    melody1,
                                    melody2: md5(userid),
                                });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Account Setup Error:', error);
            socket.emit('_businessSetup', {
                type: 'error',
                message: error.message || 'Unexpected error occurred',
            });
        }
    });
};
