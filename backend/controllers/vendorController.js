const Vendor = require('../models/VendorModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const SessionActivity = require('../models/SessionModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const gf = new GeneralFunction();

module.exports = function (socket, Database) {
    socket.on('create_vendor', async (data) => {
        const {
            name, email, phone, address,
            location,
            vendor_hiddenid, melody1, melody2
        } = data;

        const session = getSessionIDs(melody1);
        const userid = session.userid;
        const sessionid = session.sessionid;

        // Validate session
        if (md5(userid) !== melody2) {
            return socket.emit(`${melody1}_create_vendor`, {
                success: false,
                type: 'caution',
                message: 'Session expired. Please refresh and try again.'
            });
        }

        const VendorModel = new Vendor(Database);
        const PrivilegeModel = new Privilege(Database, userid);
        const SessionActivityModel = new SessionActivity(Database);

        const isNewVendor = !vendor_hiddenid || vendor_hiddenid.trim() === '';
        const requiredFields = [name, email, phone, address, location];
        
        if (gf.ifEmpty(requiredFields).includes('empty')) {
            return socket.emit(`${melody1}_create_vendor`, {
                success: false,
                message: 'Please fill in all required fields.'
            });
        }

        try {
            const privilegeData = (await PrivilegeModel.getPrivileges()).privilegeData;
            const privilege = isNewVendor
                ? privilegeData?.afrobuild?.add_vendor
                : privilegeData?.afrobuild?.update_vendor;

            if (privilege !== 'yes') {
                return socket.emit(`${melody1}_create_vendor`, {
                    success: false,
                    type: 'caution',
                    message: 'You do not have the required privilege.'
                });
            }

            // Ensure name is unique (excluding self if updating)
            const checkVendor = await VendorModel.preparedFetch({
                sql: 'name = ? AND vendorid != ?',
                columns: [name, isNewVendor ? 0 : vendor_hiddenid]
            });

            if (Array.isArray(checkVendor) && checkVendor.length > 0) {
                return socket.emit(`${melody1}_create_vendor`, {
                    success: false,
                    message: 'Vendor name is already taken.'
                });
            }

            const newVendorId = isNewVendor ? gf.getTimeStamp() : vendor_hiddenid;

            const result = isNewVendor
                ? await VendorModel.insertTable([
                    newVendorId, name, phone, email, address, location, 'active', gf.getDateTime(), sessionid
                ])
                : await VendorModel.updateTable({
                    sql: `
                        name = ?, phone = ?, email = ?, address = ?, location = ?
                        WHERE vendorid = ? AND status = ?
                    `,
                    columns: [name, phone, email, address, location, newVendorId, 'active']
                });

            if (result?.affectedRows > 0) {
                const activityId = gf.getTimeStamp();
                const activityMessage = isNewVendor ? 'Added new vendor' : 'Updated vendor info';

                await SessionActivityModel.insertTable([
                    activityId,
                    userid,
                    activityMessage,
                    gf.getDateTime(),
                    null // logout field remains null
                ]);

                return socket.emit(`${melody1}_create_vendor`, {
                    success: true,
                    message: isNewVendor
                        ? 'New vendor created successfully.'
                        : 'Vendor updated successfully.'
                });
            } else {
                return socket.emit(`${melody1}_create_vendor`, {
                    success: false,
                    message: 'No changes were made.'
                });
            }

        } catch (err) {
            console.error('Error in create_vendor:', err);
            return socket.emit(`${melody1}_create_vendor`, {
                success: false,
                message: 'Internal server error: ' + err.message
            });
        }
    });
};
