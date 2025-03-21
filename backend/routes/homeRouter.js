const User = require('../model/models/UserModel');
const Session = require('../model/models/SessionModel');
const Privilege = require('../model/models/PrivilegeFeaturesModel');
const path = require('path')
const dotenv = require('dotenv')
dotenv.config({path: path.join(__dirname, `../../system.env`)})

module.exports = function (start, Database) {

    start.get('/', function (request, response) {
        queryStr = request.query;
        const confiq = process.env
        if (confiq && confiq.DB_NAME && confiq.DB_NAME != '' || confiq.DB_NAME != undefined) {
            Database.dbcon.query('SELECT * FROM setup WHERE 1', async function(error, result) {
                if (error) {
                    new Setup(Database);
                    new Privilege(Database, 0);
                    new Employee(Database);
                    new User(Database);
                    new UserEmployee(Database);
                    new Session(Database);

                    console.log('Third error run');
                    response.render('setup', {pageNavigate: queryStr});
                } else {
                    if (Array.isArray(result) && result.length > 0) {
                        const SetupModel = new Setup(Database);
                        new Privilege(Database, 0);

                        result = await SetupModel.preparedFetch({
                            sql: '1',
                            columns: []
                        });
                        if (result.length > 0) {
                            let setupData = result.length > 0 ? result : {};
                        } else {
                            response.render('setup', { pageNavigate: queryStr }); 
                        }
                    } else {
                        new Privilege(Database, 0);
                        console.log('Forth error run');
                        response.render('setup', {pageNavigate: queryStr});
                    }
                }
            });
        } else {
            console.log('First error run');
            response.render('setup', { pageNavigate: queryStr });
        }
    });
}


String.prototype.shuffle = function () {
    var a = this.split(""), n = a.length;
    for (var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}