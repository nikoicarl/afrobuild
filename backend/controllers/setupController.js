const Setup = require('../models/SetupModel');
const UserModel = require('../models/UserModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const crypto = require('crypto');  // Add the crypto module

const gf = new GeneralFunction();


module.exports = (socket, Database) => {
    socket.on('businessSetup', async (socketData) => {
        try {
            const {
                name,
                email,
                mobile,
                country,
                region,
                address,
                hiddenid,
                logo,
                primary_color,
                sessionid
            } = socketData;

            // Validation check for required fields
            if (!name || !email || !mobile || !country || !region || !address) {
                socket.emit('error', { message: 'Required fields missing.' });
                return;
            }

            // Email validation using regular expression
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailRegex.test(email)) {
                socket.emit('error', { message: 'Invalid email format.' });
                return;
            }

            // INSERT NEW USER BEFORE SETUP
            const User = new UserModel(Database);
            const existingUser = await User.preparedFetch({
                sql: 'email = ?',
                columns: [email]
            });

            if (!Array.isArray(existingUser) || existingUser.length === 0) {
                const userid = gf.getTimeStamp();
                const date_time = gf.getDateTime();

                const nameParts = name.split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(' '); // Join remaining parts as last name

                // Hash the password before storing (MD5 example)
                const hashedPassword = crypto.createHash('md5').update('12345').digest('hex'); // Set default password as '12345'

                const userColumns = [
                    userid,
                    firstName,          // first_name
                    lastName || '',     // last_name
                    mobile,             // phone
                    email,              // email
                    address,            // address
                    email.split('@')[0],// username (basic example)
                    hashedPassword,     // password (set as MD5 hashed)
                    'active',           // status
                    date_time           // date_time
                ];

                await User.insertTable(userColumns);
            }

            // INSERT OR UPDATE SETUP
            await insertOrUpdateHandler({
                socket,
                Database,
                ModelClass: Setup,
                PrivilegeClass: Privilege,
                socketData: { hiddenid },
                requiredFields: [name, email, mobile, country, region, address],
                uniqueCheck: { email },
                columnsToInsert: [
                    gf.getTimeStamp(),
                    name,
                    email,
                    mobile,
                    address,
                    country,
                    region,
                    '',
                    '',
                    logo || '',
                    primary_color || '',
                    'active',
                    gf.getDateTime(),
                    sessionid || ''
                ],
                columnsToUpdate: [
                    { name: 'name', value: name },
                    { name: 'email', value: email },
                    { name: 'phone', value: mobile },
                    { name: 'address', value: address },
                    { name: 'country', value: country },
                    { name: 'state_region', value: region },
                    { name: 'logo', value: logo || '' },
                    { name: 'primary_color', value: primary_color || '' }
                ],
                privilegeName: 'setup',
                eventName: 'businessSetup'
            });

            socket.emit('success', { message: 'Business setup updated successfully.' });

        } catch (error) {
            console.error(error);
            socket.emit('error', { message: 'An error occurred during the setup process.' });
        }
    });
};

