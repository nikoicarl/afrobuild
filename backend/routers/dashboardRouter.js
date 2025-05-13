const User = require('../models/UserModel');
const Privilege = require('../models/PrivilegeFeaturesModel');

const md5 = require('md5');
let getSessionIDs = require('../controllers/getSessionIDs');
const path = require('path')
const dotenv = require('dotenv')
dotenv.config({path: path.join(__dirname, `./../../system.env`)})


module.exports = function(start, Database) {
    start.get('/dashboard', async function(request, response) {
        queryStr = request.query;

        const confiq = process.env
        if (confiq.DB_NAME && confiq.DB_NAME != '' || confiq.DB_NAME != undefined) {
            Database.dbcon.query('select 1 from setup limit 1', async function(error, result) {
                if (error) {
                    response.render('setup', {pageNavigate: queryStr, setupData: {}});
                } else {
                    Database.dbcon.query('SELECT * FROM setup WHERE 1', async function(error, result) {
                        if (error) {
                            response.render('setup', {pageNavigate: queryStr, setupData: {}});
                        } else {
                            if (Array.isArray(result) && result.length > 0) {
                                let session = getSessionIDs(queryStr.med);
                                let userid = session.userid;
                                let sessionid = session.sessionid;
                                if (md5(userid) == queryStr.pub) {
                                    const UserModel = new User(Database);
                                    let userResult = await UserModel.preparedFetch({
                                        sql: 'userid = (SELECT userid FROM session WHERE sessionid = ? AND logout IS NULL)',
                                        columns: [sessionid]
                                    });
                                    if (Array.isArray(userResult)) {
                                        if (userResult.length > 0) {
                                            const PrivilegeModel = new Privilege(Database, userid);

                                            if (Array.isArray(employResult)) {
                                            
                                                let privilegeData = (await PrivilegeModel.getPrivileges()).privilegeData;

                                                response.render('dashboard', {
                                                    pageNavigate: queryStr, 
                                                    userData: userResult[0],
                                                    privilege: privilegeData
                                                });
                                            } else {
                                                console.log('Invalid user ID 2nd');
                                                response.render('index', {pageNavigate: {error: 'loginError4'}, setupData: {}});
                                            }

                                            
                                        } else {
                                            console.log('Invalid user ID 1st');
                                            response.render('index', {pageNavigate: {error: 'loginError3'}, setupData: {}});
                                        }
                                    } else {
                                        console.log('Invalid user ID 0th');
                                        response.render('index', {pageNavigate: {error: 'loginError2'}, setupData: {}});
                                    }
                                } else {
                                    console.log('Invalid user ID -1th');
                                    response.render('index', {pageNavigate: {error: 'loginError1'}, setupData: {}});
                                }
                            } else {
                                response.render('setup', {pageNavigate: queryStr, setupData: {}});
                            }
                        }
                    });
                }
            });
        } else {
            response.render('setup', {pageNavigate: queryStr});
        }
    });
}