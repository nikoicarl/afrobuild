const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../system.env') });

const User = require('../models/UserModel');
const Session = require('../models/SessionModel');
const Setup = require('../models/SetupModel');
const Privilege = require('../models/PrivilegeFeaturesModel');

module.exports = function (app, Database) {
    app.get('/', async (request, response) => {
        const queryStr = request.query;
        const config = process.env;

        if (config && config.DB_NAME && config.DB_NAME.trim() !== '') {
            try {
                Database.dbcon.query('SELECT * FROM setup WHERE 1', async (error, results) => {
                    if (error || !Array.isArray(results)) {
                        // Initialize models and render setup page
                        new Setup(Database);
                        new Privilege(Database, 0);
                        new User(Database);
                        new Session(Database);
                        console.log('Error fetching setup. Rendering setup page.');
                        return response.render('setup', { pageNavigate: queryStr });
                    }

                    if (results.length > 0) {
                        const SetupModel = new Setup(Database);
                        new Privilege(Database, 0);

                        const setupData = await SetupModel.preparedFetch({
                            sql: '1',
                            columns: []
                        });

                        if (setupData && setupData.length > 0) {
                            // You can render dashboard or main UI here
                            return response.render('index', { setupData, pageNavigate: queryStr });
                        } else {
                            console.log('Setup data incomplete. Rendering setup page.');
                            return response.render('setup', { pageNavigate: queryStr });
                        }
                    } else {
                        console.log('No setup records found. Rendering setup page.');
                        new Privilege(Database, 0);
                        return response.render('setup', { pageNavigate: queryStr });
                    }
                });
            } catch (err) {
                console.error('Unexpected error in home route:', err);
                return response.render('setup', { pageNavigate: queryStr });
            }
        } else {
            console.log('DB_NAME not set in environment. Rendering setup page.');
            return response.render('setup', { pageNavigate: queryStr });
        }
    });
};

// Move this to a separate utility file if needed globally
String.prototype.shuffle = function () {
    const a = this.split(""), n = a.length;
    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a.join("");
};
