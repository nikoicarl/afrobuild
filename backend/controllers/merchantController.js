const Merchant = require('../models/MerchantModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const SessionActivity = require('../models/SessionModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const gf = new GeneralFunction();

module.exports = function (socket, Database) {
    socket.on('create_merchant', async (data) => {
        const {
            name, email, phone, address,
            location,
            merchant_hiddenid, melody1, melody2
        } = data;

        const session = getSessionIDs(melody1);
        const userid = session.userid;
        const sessionid = session.sessionid;

        // Validate session
        if (md5(userid) !== melody2) {
            return socket.emit(`${melody1}_create_merchant`, {
                success: false,
                type: 'caution',
                message: 'Session expired. Please refresh and try again.'
            });
        }

        const MerchantModel = new Merchant(Database);
        const PrivilegeModel = new Privilege(Database, userid);
        const SessionActivityModel = new SessionActivity(Database);

        const isNewMerchant = !merchant_hiddenid || merchant_hiddenid.trim() === '';
        const requiredFields = [name, email, phone, address, location];

        if (gf.ifEmpty(requiredFields).includes('empty')) {
            return socket.emit(`${melody1}_create_merchant`, {
                success: false,
                message: 'Please fill in all required fields.'
            });
        }

        try {
            const privilegeData = (await PrivilegeModel.getPrivileges()).privilegeData;
            const privilege = isNewMerchant
                ? privilegeData?.afrobuild?.add_merchant
                : privilegeData?.afrobuild?.update_merchant;

            if (privilege !== 'yes') {
                return socket.emit(`${melody1}_create_merchant`, {
                    success: false,
                    type: 'caution',
                    message: 'You do not have the required privilege.'
                });
            }

            // Ensure name is unique (excluding self if updating)
            const checkMerchant = await MerchantModel.preparedFetch({
                sql: 'name = ? AND merchantid != ?',
                columns: [name, isNewMerchant ? 0 : merchant_hiddenid]
            });

            if (Array.isArray(checkMerchant) && checkMerchant.length > 0) {
                return socket.emit(`${melody1}_create_merchant`, {
                    success: false,
                    message: 'Merchant name is already taken.'
                });
            }

            const newMerchantId = isNewMerchant ? gf.getTimeStamp() : merchant_hiddenid;

            const result = isNewMerchant
                ? await MerchantModel.insertTable([
                    newMerchantId, name, phone, email, address, location, 'active', gf.getDateTime(), sessionid
                ])
                : await MerchantModel.updateTable({
                    sql: `
                        name = ?, phone = ?, email = ?, address = ?, location = ?
                        WHERE merchantid = ? AND status = ?
                    `,
                    columns: [name, phone, email, address, location, newMerchantId, 'active']
                });

            if (result?.affectedRows > 0) {
                const activityId = gf.getTimeStamp();
                const activityMessage = isNewMerchant ? 'Added new merchant' : 'Updated merchant info';

                await SessionActivityModel.insertTable([
                    activityId,
                    userid,
                    activityMessage,
                    gf.getDateTime(),
                    null
                ]);

                return socket.emit(`${melody1}_create_merchant`, {
                    success: true,
                    message: isNewMerchant
                        ? 'New merchant created successfully.'
                        : 'Merchant updated successfully.'
                });
            } else {
                return socket.emit(`${melody1}_create_merchant`, {
                    success: false,
                    message: 'No changes were made.'
                });
            }

        } catch (err) {
            console.error('Error in create_merchant:', err);
            return socket.emit(`${melody1}_create_merchant`, {
                success: false,
                message: 'Internal server error: ' + err.message
            });
        }
    });
};
