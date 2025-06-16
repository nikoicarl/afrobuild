const User = require('../models/UserModel');
const Role = require('../models/RoleModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const Setup = require('../models/SetupModel');
const md5 = require('md5');
const getSessionIDs = require('../controllers/getSessionIDs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, './../../system.env') });

module.exports = function (start, Database) {
    start.get('/dashboard', async function (request, response) {
        const queryStr = request.query;
        const config = process.env;

        if (config.DB_NAME) {
            Database.dbcon.query('SELECT 1 FROM setup LIMIT 1', async function (error) {
                if (error) {
                    console.error('Setup table check failed:', error);
                    return response.render('setup', { pageNavigate: queryStr, setupData: {} });
                }

                Database.dbcon.query('SELECT * FROM setup WHERE 1', async function (error, result) {
                    if (error) {
                        console.error('Failed to fetch setup data:', error);
                        return response.render('setup', { pageNavigate: queryStr, setupData: {} });
                    }

                    if (Array.isArray(result) && result.length > 0) {
                        const session = getSessionIDs(queryStr.med);
                        const userid = session.userid;
                        const sessionid = session.sessionid;

                        if (md5(userid) === queryStr.pub) {
                            const UserModel = new User(Database);
                            const userResult = await UserModel.preparedFetch({
                                sql: 'userid = (SELECT userid FROM session WHERE sessionid = ? AND logout IS NULL)',
                                columns: [sessionid]
                            });

                            if (Array.isArray(userResult) && userResult.length > 0) {
                                const user = userResult[0];
                                const PrivilegeModel = new Privilege(Database, userid);
                                const SetupModel = new Setup(Database);
                                const RoleModel = new Role(Database);

                                try {
                                    // Get user privileges
                                    const { privilegeData } = await PrivilegeModel.getPrivileges();

                                    // Get setup data
                                    const setupResult = await SetupModel.preparedFetch({
                                        sql: '1',
                                        columns: []
                                    });

                                    // Get role data
                                    const roleResult = await RoleModel.preparedFetch({
                                        sql: 'roleid = ?',
                                        columns: [user.user_role || '']
                                    });

                                    const roleData = Array.isArray(roleResult) && roleResult.length > 0 ? roleResult[0] : {};

                                    // Render dashboard with role info
                                    return response.render('dashboard', {
                                        pageNavigate: queryStr,
                                        userData: user,
                                        privilege: privilegeData || [],
                                        setupData: setupResult.length > 0 ? setupResult[0] : {},
                                        roleData
                                    });

                                } catch (err) {
                                    console.error('Error during session setup:', err);
                                    return response.render('index', {
                                        pageNavigate: { error: 'loginError5' },
                                        setupData: {}
                                    });
                                }

                            } else {
                                console.warn('User not found or session invalid');
                                return response.render('index', {
                                    pageNavigate: { error: 'loginError3' },
                                    setupData: {}
                                });
                            }

                        } else {
                            console.warn('Invalid user hash');
                            return response.render('index', {
                                pageNavigate: { error: 'loginError1' },
                                setupData: {}
                            });
                        }
                    } else {
                        console.warn('No setup records found');
                        return response.render('setup', { pageNavigate: queryStr, setupData: {} });
                    }
                });
            });
        } else {
            console.warn('DB_NAME not defined in environment variables');
            response.render('setup', { pageNavigate: queryStr });
        }
    });
};
