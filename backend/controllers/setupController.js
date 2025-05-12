const Setup = require('../model/models/SetupModel');
const Privilege = require('../model/models/PrivilegeFeaturesModel');
const insertOrUpdateHandler = require('../../handlers/insertOrUpdateHandler'); // adjust path if needed

module.exports = (socket, Database) => {
    socket.on('insertSetup', async (socketData) => {
        const {
            name,
            email,
            mobile,
            country,
            region,
            address,
            melody1,
            melody2,
            hiddenid,
            logo,
            primary_color,
            sessionid
        } = socketData;

        // Call insert or update handler
        await insertOrUpdateHandler({
            socket,
            Database,
            ModelClass: Setup,
            PrivilegeClass: Privilege,
            socketData: {
                melody1,
                melody2,
                hiddenid
            },
            requiredFields: [name, email, mobile, country, region, address],
            uniqueCheck: {}, // Add a unique check if needed
            columnsToInsert: [
                gf.getTimeStamp(),    // setupid
                name,                 // name
                email,                // email
                mobile,               // phone
                address,              // address
                country,              // country
                region,               // state_region
                '',                   // city
                '',                   // zipcode
                logo || '',           // logo
                primary_color || '',  // primary_color
                'active',             // status (added by handler)
                gf.getDateTime(),     // date_time (added by handler)
                sessionid || ''       // sessionid (added by handler)
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
            eventName: 'insertSetup',
            melody1
        });
    });
};
