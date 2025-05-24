const Category = require('../models/CategoryModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const SessionActivity = require('../models/SessionModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const gf = new GeneralFunction();

module.exports = function (socket, Database) {
    socket.on('create_category', async (data) => {
        const {
            name, description, category_hiddenid, melody1, melody2
        } = data;

        const session = getSessionIDs(melody1);
        const userid = session.userid;
        const sessionid = session.sessionid;

        // Validate session
        if (md5(userid) !== melody2) {
            return socket.emit(`${melody1}_create_category`, {
                success: false,
                type: 'caution',
                message: 'Session expired. Please refresh and try again.'
            });
        }

        const CategoryModel = new Category(Database);
        const PrivilegeModel = new Privilege(Database, userid);
        const SessionActivityModel = new SessionActivity(Database);

        const isNewCategory = !category_hiddenid || category_hiddenid.trim() === '';
        const requiredFields = isNewCategory ? [name] : [name];

        // Check for empty fields
        const checkEmpty = gf.ifEmpty(requiredFields);
        if (checkEmpty.includes('empty')) {
            return socket.emit(`${melody1}_create_category`, {
                success: false,
                message: 'Please fill in all required fields.'
            });
        }

        try {
            const privilegeData = (await PrivilegeModel.getPrivileges()).privilegeData;
            const privilege = isNewCategory
                ? privilegeData?.afrobuild?.add_category
                : privilegeData?.afrobuild?.update_category;

            if (privilege !== 'yes') {
                return socket.emit(`${melody1}_create_category`, {
                    success: false,
                    type: 'caution',
                    message: 'You do not have the required privilege.'
                });
            }

            // Ensure category name is unique (excluding self if updating)
            const checkCategory = await CategoryModel.preparedFetch({
                sql: 'name = ? AND categoryid != ?',
                columns: [name, isNewCategory ? 0 : category_hiddenid]
            });

            if (Array.isArray(checkCategory) && checkCategory.length > 0) {
                return socket.emit(`${melody1}_create_category`, {
                    success: false,
                    message: 'Category name is already taken.'
                });
            }

            const newCategoryId = isNewCategory ? gf.getTimeStamp() : category_hiddenid;

            const result = isNewCategory
                ? await CategoryModel.insertTable([
                    newCategoryId, name, description, gf.getDateTime(), 'active'
                ])
                : await CategoryModel.updateTable({
                    sql: `
                        name = ?, description = ? WHERE categoryid = ?
                    `,
                    columns: [name, description, newCategoryId]
                });

            if (result?.affectedRows > 0) {
                // Record session activity
                const activityId = gf.getTimeStamp();
                const activityMessage = isNewCategory ? 'Added new category' : 'Updated category';

                await SessionActivityModel.insertTable([
                    activityId,
                    sessionid,
                    activityMessage,
                    gf.getDateTime(),
                    null // logout field remains null
                ]);

                return socket.emit(`${melody1}_create_category`, {
                    success: true,
                    message: isNewCategory
                        ? 'New category created successfully.'
                        : 'Category updated successfully.'
                });
            } else {
                return socket.emit(`${melody1}_create_category`, {
                    success: false,
                    message: 'No changes were made.'
                });
            }

        } catch (err) {
            console.error('Error in create_category:', err);
            return socket.emit(`${melody1}_create_category`, {
                success: false,
                message: 'Internal server error: ' + err.message
            });
        }
    });
};
