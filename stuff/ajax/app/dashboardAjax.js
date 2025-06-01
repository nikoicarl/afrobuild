$(document).ready(function () {
    // Safety check for melody object
    if (!melody || !melody.melody1 || !melody.melody2) {
        console.error('Melody object is missing required properties.');
        return;
    }

    // Clean up existing listeners to avoid duplicates
    socket.off('dashboardData');
    socket.off(`${melody.melody1}_transaction_table`);

    // Emit request for dashboard stats
    socket.emit('fetchDashboardData');

    // Listen once to prevent infinite rendering
    socket.on('dashboardData', function (data) {
        console.log('[Dashboard Stats]:', data);

        if (!data || typeof data !== 'object') {
            console.error('[Dashboard Stats]: Invalid data received', data);
            return;
        }

        if (typeof renderStats !== 'function') {
            console.error('renderStats is not defined.');
            return;
        }

        const statsHTML = renderStats(data);
        const tableHTML = renderTransactionTable();
        $('#afrobuild_dashboard_page_form_display').html(statsHTML + tableHTML);
    });

    // Emit request for transaction data
    socket.emit('table', {
        melody1: melody.melody1,
        melody2: melody.melody2,
        param: 'transaction_table'
    });

    // Listen for transaction table data
    socket.on(`${melody.melody1}_transaction_table`, (data) => {
        if (data.type === 'error') {
            console.error(data.message);
            return;
        }

        transactionDataTable(data);
    });

    // Function to render transaction table
    function transactionDataTable(dataJSONArray) {
        reCreateMdataTable('afrobuild_transaction_data_table', 'afrobuild_transaction_data_table_div');

        $('.afrobuild_transaction_data_table').mDatatable({
            data: {
                type: 'local',
                source: dataJSONArray,
                pageSize: 10
            },
            search: {
                input: $('#afrobuild_transaction_general_search')
            },
            columns: [
                {
                    field: 'transactionid',
                    title: 'Transaction ID',
                    template: row => `${row.transactionid}`
                },
                {
                    field: 'item_name',
                    title: 'Product/Service',
                    template: row => `${row.item_name?.toUcwords?.() || ''}`
                },
                {
                    field: 'category',
                    title: 'Category',
                    template: row => `${row.category_name?.toUcwords?.() || ''}`
                },
                {
                    field: 'full_name',
                    title: 'Customer Name',
                    template: row => `${row.full_name?.toUcwords?.() || ''}`
                },
                {
                    field: 'datetime',
                    title: 'Date',
                    template: row => row.datetime.fullDate()
                },
                {
                    field: 'merchant_name',
                    title: 'Merchant',
                    template: row => `${row.merchant_name?.toUcwords?.() || ''}`
                },
                {
                    field: 'amount',
                    title: 'Amount',
                    template: row => 
                        `${Number(row.amount).toLocaleString('en-GH', {
                            style: 'currency',
                            currency: 'GHS'
                        })}`
                },
                {
                    field: 'transaction_status',
                    title: 'Status',
                    template: row => row.transaction_status === 'active'
                        ? `<span class="badge text-bg-success">Active</span>`
                        : `<span class="badge text-bg-danger">${row.status?.toUcwords?.() || ''}</span>`
                },
                {
                    field: 'action',
                    title: 'Action',
                    template: row => {
                        const isDeactivated = row.status === 'deactivated';
                        const statusBtn = `
                            <a href="#" class="dropdown-item afrobuild_transaction_table_edit_btn"
                                data-getid="${row.transactionid}"
                                data-getname="deactivate_dashboard"
                                data-getdata="${row.item_name?.toUcwords?.() || ''}"
                                data-activate="${isDeactivated ? 'activate' : 'deactivate'}">
                                <i class="${isDeactivated ? 'icon-checkmark3' : 'icon-blocked'}"></i>
                                ${isDeactivated ? 'Reactivate' : 'Deactivate'}
                            </a>`;

                        const isAdmin = $('.hidden_delete_for_admin').val() === 'admin';
                        const deleteBtn = isAdmin
                            ? `<a href="#" class="dropdown-item afrobuild_transaction_table_edit_btn"
                                    data-getid="${row.transactionid}"
                                    data-getname="delete_dashboard"
                                    data-getdata="${row.item_name?.toUcwords?.() || ''}">
                                    <i class="icon-close2"></i> Delete
                                </a>`
                            : '';

                        return `
                            <div class="dropdown">
                                <a href="#" class="m-btn--icon-only" data-toggle="dropdown">
                                    <i class="icon-menu7" style="font-size:20px;color:grey;"></i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="afrobuild_transaction_table_edit_btn dropdown-item"
                                        href="#"
                                        data-getid="${row.transactionid}"
                                        data-getname="specific_dashboard">
                                        <i class="icon-pencil"></i> Edit Details
                                    </a>
                                    ${statusBtn}
                                    ${deleteBtn}
                                </div>
                            </div>`;
                    }
                }
            ]
        });
    }
});
