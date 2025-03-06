const Product = require('../model/models/ProductModel');
const Session = require('../model/models/SessionModel');
const GeneralFunction = require('../../models/administration/GeneralFunctionModel');
const getSessionIDs = require('../app/getSessionIDs');
const gf = new GeneralFunction();
const md5 = require('md5');


module.exports = (socket, Database)=>{
    socket.on('insertNewProduct', async (browserblob)=>{
        let name = browserblob.name;
        let description = browserblob.description;
        let generic = browserblob.price;
        let hiddenid = browserblob.hiddenid;

        let melody1 = browserblob.melody1;

        let session = getSessionIDs(melody1);
        let userid = session.userid;
        let sessionid = session.sessionid;

        if (md5(userid) == browserblob.melody2) {
            //Initialize connection
            const ProductModel = new Product(Database);
            const PrivilegeModel = new Privilege(Database, userid);

            //Check for empty
            let result = await gf.ifEmpty([name]);
            if (result.includes('empty')) {
                socket.emit(melody1+'_insertNewProduct', {
                    type: 'caution',
                    message: 'Some fields are required !'
                });
            } else {
                let privilegeData = (await PrivilegeModel.getPrivileges()).privilegeData;

                let privilege = (hiddenid == "" || hiddenid == undefined) ? privilegeData.add_product : privilegeData.update_product;
                if (privilege == "yes") {
                    let productid = hiddenid == "" || hiddenid == undefined ? 0 : hiddenid;
                    result = await ProductModel.preparedFetch({
                        sql: 'product_name = ? AND description = ? AND productid != ? AND status =?',
                        columns: [name, description, productid, 'active']
                    });
                    if (Array.isArray(result)) {
                        if (result.length > 0) {
                            socket.emit(melody1+'_insertNewProduct', {
                                type: 'caution',
                                message: 'Sorry, product with the same name exist'
                            });
                        } else {
                            if (hiddenid == "" || hiddenid == undefined) {
                                productid = gf.getTimeStamp();
                                result = await ProductModel.insertTable([productid, name, description, 'active', gf.getDateTime(), sessionid]);
                            } else {
                                result = await ProductModel.updateTable({
                                    sql: 'name = ?, description = ? WHERE productid = ? AND status = ?',
                                    columns: [name, description, productid, 'active']
                                });
                            }
                            if (result.affectedRows !== undefined) {
                                const SessionModel = new Session(Database);
                                let activityid = gf.getTimeStamp();
                                result = await SessionModel.insertTable([activityid, sessionid, (hiddenid == "" || hiddenid == undefined) ? 'added a new product' : 'updated a product record', 'active', gf.getDateTime()]);
                                let message = hiddenid == "" || hiddenid == undefined ? 'Product has been created successfully' : 'Product has been updated successfully';
                                if (result.affectedRows) {
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