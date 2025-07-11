const Privilege = require('../models/PrivilegeFeaturesModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const getSessionIDs = require('./getSessionIDs');
const View = require('../models/ViewModel');
const Product = require('../models/ProductModel');
const Merchant = require('../models/MerchantModel');
const Category  = require('../models/CategoryModel');
const Vendor = require('../models/VendorModel');
const md5 = require('md5');

const gf = new GeneralFunction();

module.exports = (socket, Database) => {
    socket.on('runReport', async (browserblob) => {
        const { param, melody1 = '', transaction, date_range: rawDateRange } = browserblob;
        const session = getSessionIDs(melody1);
        const { userid } = session;
        const eventKey = `${melody1}_${param}`;

        try {
            const PrivilegeModel = new Privilege(Database, userid);
            const ViewModel = new View(Database);
            const { privilegeData } = await PrivilegeModel.getPrivileges();

            if (param === "transaction_report") {
                const hasAccess = privilegeData?.afrobuild?.view_transaction_report === "yes";

                if (!hasAccess) {
                    return socket.emit(eventKey, {
                        type: 'caution',
                        message: 'You have no privilege to run this report!'
                    });
                }

                if (!rawDateRange || !rawDateRange.includes("**")) {
                    return socket.emit(eventKey, {
                        type: 'caution',
                        message: 'Pick a date range to run report.'
                    });
                }

                const [start_date, end_date] = rawDateRange.split("**").map(s => s.trim());
                let sql, columns;

                if (!transaction || transaction.trim() === "") {
                    sql = `datetime BETWEEN ? AND ?`;
                    columns = [start_date, end_date];
                } else {
                    sql = `transactionid = ? AND datetime BETWEEN ? AND ?`;
                    columns = [transaction.trim(), start_date, end_date];
                }

                const result = await ViewModel.getGeneral({
                    table: 'transaction_view',
                    sql,
                    columns
                });

                if (!Array.isArray(result) || result.length === 0) {
                    return socket.emit(eventKey, {
                        type: 'caution',
                        message: 'No data found for the selected range.'
                    });
                }

                return socket.emit(eventKey, {
                    data: result,
                    reportType: transaction ? 'transaction' : 'date'
                });
            }

            if (param === "product_report") {
                const hasAccess = privilegeData?.afrobuild?.view_product_report === "yes";
                const ProductModel = new Product(Database);

                if (!hasAccess) {
                    return socket.emit(eventKey, {
                        type: 'caution',
                        message: 'You have no privilege to run this report!'
                    });
                }

                if (!rawDateRange || !rawDateRange.includes("**")) {
                    return socket.emit(eventKey, {
                        type: 'caution',
                        message: 'Pick a date range to run report.'
                    });
                }

                const [start_date, end_date] = rawDateRange.split("**").map(s => s.trim());
                const product = browserblob.product || '';

                let sql, columns;
                if (product) {
                    sql = `productid = ? AND datetime BETWEEN ? AND ?`;
                    columns = [product.trim(), start_date, end_date];
                } else {
                    sql = `datetime BETWEEN ? AND ?`;
                    columns = [start_date, end_date];
                }

                const result = await ProductModel.preparedFetch({
                    sql,
                    columns,
                    order: 'datetime ASC'
                });

                if (!Array.isArray(result) || result.length === 0) {
                    return socket.emit(eventKey, {
                        type: 'caution',
                        message: 'No data found for the selected range.'
                    });
                }

                return socket.emit(eventKey, {
                    data: result,
                    reportType: product ? 'product' : 'date'
                });
            }

            if (param === "merchant_report") {
                const hasAccess = privilegeData?.afrobuild?.view_merchant_report === "yes";
                const MerchantModel = new Merchant(Database);

                if (!hasAccess) {
                    return socket.emit(eventKey, {
                        type: 'caution',
                        message: 'You have no privilege to run this report!'
                    });
                }

                if (!rawDateRange || !rawDateRange.includes("**")) {
                    return socket.emit(eventKey, {
                        type: 'caution',
                        message: 'Pick a date range to run report.'
                    });
                }

                const [start_date, end_date] = rawDateRange.split("**").map(s => s.trim());
                const merchant = browserblob.merchant || '';

                let sql, columns;
                if (merchant) {
                    sql = `merchantid = ? AND date_time BETWEEN ? AND ?`;
                    columns = [merchant.trim(), start_date, end_date];
                } else {
                    sql = `date_time BETWEEN ? AND ?`;
                    columns = [start_date, end_date];
                }

                const result = await MerchantModel.preparedFetch({
                    sql,
                    columns,
                    order: 'date_time ASC'
                });

                if (!Array.isArray(result) || result.length === 0) {
                    return socket.emit(eventKey, {
                        type: 'caution',
                        message: 'No data found for the selected range.'
                    });
                }

                return socket.emit(eventKey, {
                    data: result,
                    reportType: merchant ? 'merchant' : 'date'
                });
            }

            if (param === "category_report") {
                const hasAccess = privilegeData?.afrobuild?.view_category_report === "yes";
                const CategoryModel = new Category(Database);

                if (!hasAccess) {
                    return socket.emit(eventKey, {
                        type: 'caution',
                        message: 'You have no privilege to run this report!'
                    });
                }

                if (!rawDateRange || !rawDateRange.includes("**")) {
                    return socket.emit(eventKey, {
                        type: 'caution',
                        message: 'Pick a date range to run report.'
                    });
                }

                const [start_date, end_date] = rawDateRange.split("**").map(s => s.trim());
                const category = browserblob.category || '';

                let sql, columns;
                if (category) {
                    sql = `categoryid = ? AND datetime BETWEEN ? AND ?`;
                    columns = [category.trim(), start_date, end_date];
                } else {
                    sql = `datetime BETWEEN ? AND ?`;
                    columns = [start_date, end_date];
                }

                const result = await CategoryModel.preparedFetch({
                    sql,
                    columns,
                    order: 'datetime ASC'
                });

                if (!Array.isArray(result) || result.length === 0) {
                    return socket.emit(eventKey, {
                        type: 'caution',
                        message: 'No data found for the selected range.'
                    });
                }

                return socket.emit(eventKey, {
                    data: result,
                    reportType: category ? 'category' : 'date'
                });
            }

            if (param === "vendor_report") {
                const hasAccess = privilegeData?.afrobuild?.view_vendor_report === "yes";
                const VendorModel = new Vendor(Database);

                if (!hasAccess) {
                    return socket.emit(eventKey, {
                        type: 'caution',
                        message: 'You have no privilege to run this report!'
                    });
                }

                if (!rawDateRange || !rawDateRange.includes("**")) {
                    return socket.emit(eventKey, {
                        type: 'caution',
                        message: 'Pick a date range to run report.'
                    });
                }

                const [start_date, end_date] = rawDateRange.split("**").map(s => s.trim());
                const vendor = browserblob.vendor || '';

                let sql, columns;
                if (vendor) {
                    sql = `vendorid = ? AND date_time BETWEEN ? AND ?`;
                    columns = [vendor.trim(), start_date, end_date];
                } else {
                    sql = `date_time BETWEEN ? AND ?`;
                    columns = [start_date, end_date];
                }

                const result = await VendorModel.preparedFetch({
                    sql,
                    columns,
                    order: 'date_time ASC'
                });

                if (!Array.isArray(result) || result.length === 0) {
                    return socket.emit(eventKey, {
                        type: 'caution',
                        message: 'No data found for the selected range.'
                    });
                }

                return socket.emit(eventKey, {
                    data: result,
                    reportType: vendor ? 'vendor' : 'date'
                });
            }



        } catch (error) {
            console.error("runReport error:", error);
            return socket.emit(eventKey, {
                type: 'error',
                message: 'Internal server error. Please try again later.'
            });
        }
    });
};
