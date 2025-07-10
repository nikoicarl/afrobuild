$(document).ready(function () {
    const privilege = JSON.parse($('.hidden_privilege_data').val());
    const hasPrivilege = key => privilege?.afrobuild?.[key] === 'yes';
    const dashboardDisplay = $('#afrobuild_dashboard_page_form_display');

    dashboardDisplay.empty();

    // Handle form submission for transaction actions
    $(document).on('click', '.afrobuild_action_submit_btn', function (e) {
        e.preventDefault();

        const actionData = {
            message: $('.afrobuild_transaction_action_msg').val().trim(),
            dataId: $('.afrobuild_transaction_hiddenid').val().trim(),
            action: $('.afrobuild_transaction_hidden_action').val().trim(),
            param: 'specific_transaction',
            melody1: melody.melody1,
            melody2: melody.melody2
        };

        const $submitBtn = $(this)
            .html('<div class="spinner-border loader-sm" role="status"></div>')
            .attr('disabled', true);

        setTimeout(() => {
            socket.emit('specific', actionData);

            socket.once(`${actionData.melody1}_specific_transaction`, (res) => {
                $submitBtn.html('Submit').removeAttr('disabled');

                if (res && typeof res.success !== 'undefined') {
                    Swal.fire({
                        title: res.success ? 'Success' : 'Error',
                        text: res.message || (res.success
                            ? `Transaction ${actionData.action.replace(/_/g, ' ')} successfully.`
                            : `Failed to ${actionData.action.replace(/_/g, ' ')} transaction.`),
                        icon: res.success ? 'success' : 'error',
                        showConfirmButton: !res.success,
                        timer: res.success ? 2000 : undefined
                    });

                    if (res.success) {
                        // Refresh the table
                        socket.emit('table', {
                            melody1: melody.melody1,
                            melody2: melody.melody2,
                            param: 'transaction_table'
                        });

                        // Reset the form fields
                        $('.afrobuild_transaction_action_msg').val('');
                        $('.afrobuild_transaction_hiddenid').val('');
                        $('.afrobuild_transaction_hidden_action').val('');

                        // Optionally close the modal (if desired)
                        $('#afrobuild_transaction_action_modal').modal('hide');
                    }

                } else {
                    Swal.fire('Error', 'Invalid response received from the server.', 'error');
                }
            });

            socket.on('error', (err) => {
                $submitBtn.html('Submit').removeAttr('disabled');
                Swal.fire('Error', 'An unexpected error occurred. Please try again later.', 'error');
            });
        }, 300);
    });


    setTimeout(() => {
        fetchActivityTable();
        const html = ejs.render(renderActivities(), {});
        dashboardDisplay.append(html);
    }, 1000);

    if (privilege?.afrobuild?.view_transaction === 'yes' && melody?.melody1 && melody?.melody2) {
        socket.off('dashboardData');
        socket.off(`${melody.melody1}_transaction_table`);

        socket.emit('fetchDashboardData');

        socket.on('dashboardData', (data) => {
            if (typeof data !== 'object' || !renderStats) {
                console.error('Invalid dashboard data or renderStats not defined');
                return;
            }

            const statsHTML = renderStats(data);
            dashboardDisplay.prepend(statsHTML);
        });
    }

    socket.emit('table', {
        melody1: melody.melody1,
        melody2: melody.melody2,
        param: 'transaction_table'
    });

    socket.on(`${melody.melody1}_transaction_table`, (data) => {
        if (data?.type === 'error') {
            console.error(data.message);
        } else {
            const tableHTML = renderTransactionTable(); // this function should return the HTML markup
            dashboardDisplay.append(tableHTML);
            renderTransactionDataTable(data);

        }
    });

    // Action Modal
    $(document).on('click', '.afrobuild_transaction_table_edit_btn', function (e) {
        e.preventDefault();

        const action = $(this).data('getname');
        const transactionId = $(this).data('getid');
        const name = $(this).data('getdata');
        const rawData = $(this).data('viewdata') || '';
        const viewData = rawData ? JSON.parse(decodeURIComponent(rawData)) : null;

        if (action && action !== 'view_transaction') {
            const modalTitle = $('.modal-header .modal-title');
            const formattedAction = action.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
            modalTitle.text(`${formattedAction}${transactionId ? ` - ${transactionId}` : ''}`);

            $('.afrobuild_transaction_hidden_action').val(action);
            $('.afrobuild_transaction_hiddenid').val(transactionId);

            $('.afrobuild_transaction_action_modal').trigger('click');
        } else if (action === 'view_transaction') {
            const viewModal = $('.afrobuild_transaction_view_modal');
            viewModal.find('.modal-header .modal-title').text(`Transaction Details - ${transactionId}`);
            viewModal.find('.afrobuild_transaction_view_id').val(transactionId);
            viewModal.find('.afrobuild_transaction_view_product').val(name);

            // Text fields
            viewModal.find('.afrobuild_view_reason').text(viewData?.message.toUcwords?.() || 'N/A');

            // Customer
            viewModal.find('.afrobuild_view_customer').text(viewData?.customer_full_name?.toUcwords?.() || 'N/A');

            // Date
            viewModal.find('.afrobuild_view_date').text(viewData?.datetime?.fullDate?.() || 'N/A');

            // Amount
            viewModal.find('.afrobuild_view_amount').text(
                Number(viewData?.amount || 0).toLocaleString('en-GH', {
                    style: 'currency',
                    currency: 'GHS'
                })
            );

            // Status badge
            const status = (viewData?.status || 'unknown').toLowerCase();
            const label = status.charAt(0).toUpperCase() + status.slice(1);
            const badgeMap = {
                active: 'success',
                pending: 'warning',
                failed: 'danger',
                completed: 'success',
                cancelled: 'danger',
                flagged: 'secondary'
            };
            const badgeClass = badgeMap[status] || 'secondary';
            const statusBadge = `<span class="badge text-bg-${badgeClass}">${label}</span>`;
            viewModal.find('.afrobuild_view_status').html(statusBadge);

            // Render Items Table
            const itemsTableBody = viewModal.find('.afrobuild_view_items_table_body');
            itemsTableBody.empty();

            if (Array.isArray(viewData?.items) && viewData.items.length > 0) {
                viewData.items.forEach((item, index) => {
                    const row = `
                <tr>
                    <td>${item.transaction_itemsid}</td>
                    <td>${String(item.item_name.toUcwords() ?? '')}</td>
                    <td>${String(item.itemtype.toUcwords() ?? '')}</td>
                    <td>${String(item.category_name.toUcwords() ?? '')}</td>
                    <td>${item.quantity ?? 0}</td>
                    <td>${Number(item.unit_price ?? 0).toLocaleString('en-GH', {
                        style: 'currency',
                        currency: 'GHS'
                    })}</td>
                    <td>${Number(item.subtotal ?? 0).toLocaleString('en-GH', {
                        style: 'currency',
                        currency: 'GHS'
                    })}</td>
                </tr>
            `;
                    itemsTableBody.append(row);
                });
            } else {
                itemsTableBody.append(`<tr><td colspan="7" class="text-center">No items found</td></tr>`);
            }

            viewModal.trigger('click');
        }
        else {
            $('.afrobuild_transaction_hidden_action').val('');
            $('.afrobuild_transaction_hiddenid').val('');
        }
    });

    // Render DataTable
    function renderTransactionDataTable(data) {
        reCreateMdataTable('afrobuild_transaction_data_table', 'afrobuild_transaction_data_table_div');

        $('.afrobuild_transaction_data_table').mDatatable({
            data: {
                type: 'local',
                source: data,
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
                    field: 'customer_full_name',
                    title: 'Customer Name',
                    template: row => `${row.customer_full_name?.toUcwords?.() || ''}`
                },
                {
                    field: 'datetime',
                    title: 'Date',
                    template: row => row.datetime?.fullDate?.() || ''
                },
                {
                    field: 'amount',
                    title: 'Amount',
                    template: row => `${Number(row.amount).toLocaleString('en-GH', {
                        style: 'currency',
                        currency: 'GHS'
                    })}`
                },
                {
                    field: 'status',
                    title: 'Status',
                    template: row => {
                        const status = (row.status || '').toLowerCase();
                        const label = status.charAt(0).toUpperCase() + status.slice(1);
                        const badgeMap = {
                            active: 'success',
                            pending: 'warning',
                            failed: 'danger',
                            completed: 'success',
                            cancelled: 'danger',
                            flagged: 'secondary'
                        };
                        const badgeClass = badgeMap[status] || 'secondary';
                        return `<span class="badge text-bg-${badgeClass}">${label}</span>`;
                    }
                },
                {
                    field: 'action',
                    title: 'Action',
                    sortable: false,
                    template: row => {
                        const dataEncoded = encodeURIComponent(JSON.stringify(row));
                        const status = row.status?.toLowerCase?.();
                        const transactionId = row.transactionid;
                        const actions = [];

                        if (hasPrivilege('mark_completed_transaction') && (status === 'pending' || status === 'active')) {
                            actions.push(`
                            <a class="afrobuild_transaction_table_edit_btn dropdown-item"
                               href="#"
                               data-getid="${transactionId}"
                               data-getname="mark_completed">
                                <i class="icon-checkmark"></i> Mark as Completed
                            </a>`);
                        }

                        if (hasPrivilege('cancel_transaction') && (status === 'pending' || status === 'active')) {
                            actions.push(`
                            <a class="afrobuild_transaction_table_edit_btn dropdown-item"
                               href="#"
                               data-getid="${transactionId}"
                               data-getname="mark_cancelled">
                                <i class="icon-cross2"></i> Cancel Transaction
                            </a>`);
                        }

                        if (hasPrivilege('reactivate_transaction') && status === 'cancelled') {
                            actions.push(`
                            <a class="afrobuild_transaction_table_edit_btn dropdown-item"
                               href="#"
                               data-getid="${transactionId}"
                               data-getname="reactivate_transaction">
                                <i class="icon-redo2"></i> Reactivate
                            </a>`);
                        }

                        if (hasPrivilege('flag_transaction') && ['cancelled', 'pending', 'active'].includes(status)) {
                            actions.push(`
                            <a class="afrobuild_transaction_table_edit_btn dropdown-item"
                               href="#"
                               data-getid="${transactionId}"
                               data-getname="flag_transaction">
                                <i class="icon-flag7"></i> Flag Transaction
                            </a>`);
                        }

                        if (hasPrivilege('mark_completed_transaction') && status === 'active') {
                            actions.push(`
                            <a class="afrobuild_transaction_table_edit_btn dropdown-item"
                               href="#"
                               data-getid="${transactionId}"
                               data-getname="mark_pending">
                                <i class="icon-hour-glass"></i> Mark as Pending
                            </a>`);
                        }

                        actions.push(`
                        <a class="afrobuild_transaction_table_edit_btn dropdown-item"
                            href="#"
                            data-getid="${transactionId}"
                            data-getname="view_transaction"
                            data-viewdata="${dataEncoded}">
                            <i class="icon-file-eye"></i> View
                        </a>`);

                        if (actions.length === 0) return '';

                        return `
                        <div class="dropdown">
                            <a href="#" class="m-btn--icon-only" data-toggle="dropdown">
                                <i class="icon-menu7" style="font-size:20px;color:grey;"></i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right">
                                ${actions.join('')}
                            </div>
                        </div>`;
                    }
                }
            ]
        });
    }


    function fetchActivityTable() {
        socket.off('table');
        socket.off(`${melody?.melody1}_activity_table`);

        socket.emit('table', {
            melody1: melody?.melody1,
            melody2: melody?.melody2,
            param: 'activity_table'
        });

        socket.on(`${melody?.melody1}_activity_table`, (data) => {
            const activityContainer = $('.afrobuild_dashboard_session_activity');
            activityContainer.empty();

            if (data?.type === 'error') {
                console.log(data.message);
                return;
            }

            if (Array.isArray(data) && data.length) {
                data.forEach(entry => {
                    const act = entry.activity?.toLowerCase?.() || '';
                    let color = 't-success', icon = 'icon-check2';

                    if (act.includes('deactivated')) {
                        color = 't-warning';
                        icon = 'icon-blocked';
                    } else if (act.includes('logged out')) {
                        color = 't-danger';
                        icon = 'icon-exit3';
                    } else if (act.includes('logged in')) {
                        color = 't-info';
                        icon = 'icon-check2';
                    } else if (act.includes('sent')) {
                        color = 't-success';
                        icon = 'icon-mail5';
                    }

                    activityContainer.append(`
                        <div class="item-timeline timeline-new">
                            <div class="t-dot">
                                <div class="${color}">
                                    <i class="${icon} text-white mt-2" style="font-size:19px;"></i>
                                </div>
                            </div>
                            <div class="t-content">
                                <div class="t-uppercontent">
                                    <h5 class="mt-2">${entry.activity?.toUcwords?.()}</h5>
                                    <span>${entry.datetime?.fullDateTime?.() || ''}</span>
                                </div>
                            </div>
                        </div>
                    `);
                });
            } else {
                activityContainer.html(`<h5 class="text-muted">No Session Activities</h5>`);
            }
        });
    }
});
