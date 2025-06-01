$(document).ready(function () {
    let privilege = JSON.parse($('.hidden_privilege_data').val());

    // Always fetch session activities
    activitiesTableFetch();

    // Check if user has privilege to view transactions
    if (privilege.afrobuild && privilege.afrobuild.view_transaction === 'yes') {
        // Safety check for melody object
        if (!melody || !melody.melody1 || !melody.melody2) {
            console.error('Melody object is missing required properties.');
            return;
        }

        // Remove previous listeners to avoid duplication
        socket.off('dashboardData');
        socket.off(`${melody.melody1}_transaction_table`);

        // Emit request for dashboard data
        socket.emit('fetchDashboardData');

        socket.on('dashboardData', function (data) {
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

        // Request transaction table data
        socket.emit('table', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: 'transaction_table'
        });

        socket.on(`${melody.melody1}_transaction_table`, (data) => {
            if (data.type === 'error') {
                console.error(data.message);
                return;
            }
            transactionDataTable(data);
        });

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
                        template: row => {
                            const status = (row.transaction_status || '').toLowerCase();
                            const label = status.charAt(0).toUpperCase() + status.slice(1);

                            let badgeClass = 'secondary';
                            if (status === 'active') badgeClass = 'success';
                            else if (status === 'pending') badgeClass = 'warning';
                            else if (status === 'failed') badgeClass = 'danger';
                            else if (status === 'completed') badgeClass = 'success';
                            else if (status === 'cancelled') badgeClass = 'danger';

                            return `<span class="badge text-bg-${badgeClass}">${label}</span>`;
                        }
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
    } else {
        // No privilege to view transactions
        $('#afrobuild_dashboard_page_form_display').html(`
            <div class="text-center p-5">
                <h5 class="text-muted">You do not have permission to view transactions.</h5>
            </div>
        `);
    }

    // Fetch recent activity logs regardless of privilege
    function activitiesTableFetch() {
        socket.off('table');
        socket.off(melody.melody1 + '_activity_table');

        socket.emit('table', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: 'activity_table'
        });

        socket.on(melody.melody1 + '_activity_table', (data) => {
            if (data.type === 'error') {
                console.log(data.message);
            } else if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let color, icon;
                    const act = data[i].activity.toLowerCase();

                    if (act.includes("deactivated")) {
                        color = "t-warning";
                        icon = "icon-blocked";
                    } else if (act.includes("logged out")) {
                        color = "t-danger";
                        icon = "icon-exit3";
                    } else if (act.includes("logged in")) {
                        color = "t-info";
                        icon = "icon-check2";
                    } else if (act.includes("sent")) {
                        color = "t-success";
                        icon = "icon-mail5";
                    } else {
                        color = "t-success";
                        icon = "icon-check2";
                    }

                    $('.afrobuild_dashboard_session_activity').append(`
                        <div class="item-timeline timeline-new">
                            <div class="t-dot">
                                <div class="${color}">
                                    <i class="${icon} text-white mt-2" style="font-size:19px;"></i>
                                </div>
                            </div>
                            <div class="t-content">
                                <div class="t-uppercontent">
                                    <h5 class="mt-2">${data[i].activity.toUcwords()}</h5>
                                    <span>${data[i].datetime.fullDateTime()}</span>
                                </div>
                            </div>
                        </div>`);
                }
                clearNavigationLoader();
            } else {
                $('.afrobuild_dashboard_session_activity').html(`<h5 class="text-muted">No Session Activities</h5>`);
            }
        });
    }
});
