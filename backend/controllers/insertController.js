const Product = require('../model/models/ProductModel');
const Session = require('../model/models/SessionModel');
const GeneralFunction = require('../../models/administration/GeneralFunctionModel');
const getSessionIDs = require('../app/getSessionIDs');
const gf = new GeneralFunction();
const md5 = require('md5');


module.exports = (socket, Database)=>{
    socket.on('insertNewProduct', async (browserblob)=>{
        let logig_manage_product_name = browserblob.logig_manage_product_name;
        let logig_manage_product_type = browserblob.logig_manage_product_type;
        let logig_manage_product_generic = browserblob.logig_manage_product_generic;
        let logig_manage_product_manufacturer = browserblob.logig_manage_product_manufacturer;
        let logig_manage_product_description = browserblob.logig_manage_product_description;
        let logig_manage_product_hiddenid = browserblob.logig_manage_product_hiddenid;

        let melody1 = browserblob.melody1;

        let session = getSessionIDs(melody1);
        let userid = session.userid;
        let sessionid = session.sessionid;

        if (md5(userid) == browserblob.melody2) {
            //Initialize connection
            const ProductModel = new Product(Database);
            const PrivilegeModel = new Privilege(Database, userid);

            //Check for empty
            let result = await gf.ifEmpty([logig_manage_product_name]);
            if (result.includes('empty')) {
                socket.emit(melody1+'_insertNewProduct', {
                    type: 'caution',
                    message: 'Some fields are required !'
                });
            } else {
                let privilegeData = (await PrivilegeModel.getPrivileges()).privilegeData;

                let privilege = (logig_manage_product_hiddenid == "" || logig_manage_product_hiddenid == undefined) ? privilegeData.pharmacy.add_product : privilegeData.pharmacy.update_product;
                if (privilege == "yes") {
                    let productid = logig_manage_product_hiddenid == "" || logig_manage_product_hiddenid == undefined ? 0 : logig_manage_product_hiddenid;
                    result = await ProductModel.preparedFetch({
                        sql: 'product_name = ? AND type = ? AND productid != ? AND status =?',
                        columns: [logig_manage_product_name, logig_manage_product_type, productid, 'active']
                    });
                    if (Array.isArray(result)) {
                        if (result.length > 0) {
                            socket.emit(melody1+'_insertNewProduct', {
                                type: 'caution',
                                message: 'Sorry, product with the same name exist'
                            });
                        } else {
                            if (logig_manage_product_hiddenid == "" || logig_manage_product_hiddenid == undefined) {
                                productid = gf.getTimeStamp();
                                result = await ProductModel.insertTable([productid, logig_manage_product_name, (logig_manage_product_generic == null || logig_manage_product_generic == undefined || logig_manage_product_generic == '' ? 0 : logig_manage_product_generic), (logig_manage_product_manufacturer == null || logig_manage_product_manufacturer == undefined || logig_manage_product_manufacturer == '' ? 0 : logig_manage_product_manufacturer), logig_manage_product_type, logig_manage_product_description, 'active', gf.getDateTime(), sessionid]);
                            } else {
                                result = await ProductModel.updateTable({
                                    sql: 'product_name = ?, genericid = ?, manufacturerid = ?, type = ?, description = ? WHERE productid = ? AND status = ?',
                                    columns: [logig_manage_product_name, (logig_manage_product_generic == null || logig_manage_product_generic == undefined || logig_manage_product_generic == '' ? 0 : logig_manage_product_generic), (logig_manage_product_manufacturer == null || logig_manage_product_manufacturer == undefined || logig_manage_product_manufacturer == '' ? 0 : logig_manage_product_manufacturer),  logig_manage_product_type, logig_manage_product_description, productid, 'active']
                                });
                            }
                            if (result.affectedRows !== undefined) {
                                const SessionModel = new Session(Database);
                                let activityid = gf.getTimeStamp();
                                result = await SessionModel.insertTable([activityid, sessionid, (logig_manage_product_hiddenid == "" || logig_manage_product_hiddenid == undefined) ? 'added a new product' : 'updated a product record', 'active', gf.getDateTime()]);
                                let message = logig_manage_product_hiddenid == "" || logig_manage_product_hiddenid == undefined ? 'Product has been created successfully' : 'Product has been updated successfully';
                                if (result.affectedRows) {
                                    socket.broadcast.emit('productBroadcast', 'success broadcast');
                                    socket.emit(melody1+'_insertNewProduct', {
                                        type: 'success',
                                        message: message
                                    });
                                } else {
                                    socket.emit(melody1+'_insertNewProduct', {
                                        type: 'error',
                                        message: 'Oops, something went wrong5: Error => '+result.toString()
                                    });
                                }
                            } else {
                                socket.emit(melody1+'_insertNewProduct', {
                                    type: 'error',
                                    message: 'Oops, something went wrong4: Error => '+result.toString()
                                });
                            }
                        }
                    } else {
                        socket.emit(melody1+'_insertNewProduct', {
                            type: 'error',
                            message: 'Oops, something went wrong2: Error => '+result.toString()
                        });
                    }
                } else {
                    socket.emit(melody1+'_insertNewProduct', {
                        type: 'caution',
                        message: 'You have no privilege to add new product'
                    });
                }
            }
        } else {
            socket.emit(melody1+'_insertNewProduct', {
                'type': 'caution',
                'message': 'Sorry your session has expired, wait for about 18 secconds and try again...',
                'timeout': 'no'
            });
        }
    });
}