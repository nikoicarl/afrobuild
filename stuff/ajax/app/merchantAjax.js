$(document).ready(function () {
    const socket = io();
    const $formDisplay = $('#afrobuild_merchant_page_form_display');
    const $toggleBtn = $('#afrobuild_manage_merchant_table_btn');
    const $merchantForm = $('#merchantForm');

    // Handle the toggle between table and form
    $(document).on('click.pageopener', 'h3#afrobuild_manage_merchant_table_btn', function (e) {
        e.preventDefault();
        const isTableView = $(this).data("open") === 'table';

        // Render the corresponding content based on the current state
        const html = isTableView ? ejs.render(MerchantTable(), {}) : ejs.render(renderMerchantForm(), {});
        $formDisplay.html(html);

        // Update the button text for toggling between views
        const btnText = isTableView
            ? `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M19 12H5"></path><path d="M12 5l-7 7 7 7"></path></svg> Go Back`
            : 'View All Merchants';

        // Set the button data-toggle state for next interaction
        $toggleBtn.html(btnText).data('open', isTableView ? 'form' : 'table');

        // Fetch the merchant table if we are in table view
        if (isTableView) merchantTableFetch();
    });

    // Handle merchant form submission for creating or updating a merchant
    $(document).on('click', '.afrobuild_manage_merchant_submit_btn', function (e) {
        e.preventDefault();  // Prevent the default action of the button

        const merchantData = {
            name: $('#name').val().trim(),
            email: $('#email').val().trim(),
            phone: $('#phone').val().trim(),
            location: $('#location').val().trim(),
            address: $('#address').val().trim(),
            merchant_hiddenid: $('#merchant_hiddenid').val().trim(),
            melody1: melody.melody1,
            melody2: melody.melody2
        };

        const $submitBtn = $('.afrobuild_manage_merchant_submit_btn')
            .html('<div class="spinner-border loader-sm" role="status"></div>')
            .attr('disabled', true);

        setTimeout(() => {
            // Determine if it's create or update action based on merchant_hiddenid
            const action = merchantData.merchant_hiddenid ? 'update_merchant' : 'create_merchant';

            // Emit the respective socket event
            socket.emit('create_merchant', merchantData);

            // Handle response based on action
            socket.once(`${merchantData.melody1}_${'create_merchant'}`, (res) => {
                Swal.fire({
                    title: res.success ? 'Success' : 'Error',
                    text: res.message || (res.success ? `Merchant ${action === 'create_merchant' ? 'created' : 'updated'} successfully!` : `Failed to ${action === 'create_merchant' ? 'create' : 'update'} merchant.`),
                    icon: res.success ? 'success' : 'error',
                    showConfirmButton: !res.success,
                    timer: res.success ? 2000 : undefined
                });
                $submitBtn.html('Submit').removeAttr('disabled');

                // If successful, reset the form and clean up
                if (res.success) {
                    resetMerchantForm();
                    merchantTableFetch(); // Refresh the merchant table
                }
            });

            socket.on('error', (err) => {
                $submitBtn.html('Submit').removeAttr('disabled');
                Swal.fire('Error', 'An unexpected error occurred. Please try again later.', 'error');
            });
        }, 300);
    });


    function resetMerchantForm() {
        $('#merchantForm')[0].reset();  // Reset the form fields
        $('#merchant_hiddenid').val('');  // Clear the hidden ID field
        $('.afrobuild_manage_merchant_submit_btn').html('Submit').removeAttr('disabled');  // Reset submit button text and enable
    }

    // Function to fetch and render the merchant table
    const merchantTableFetch = () => {
        socket.off('table').off(`${melody.melody1}_merchant_table`);

        socket.emit('table', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: 'merchant_table'
        });

        socket.on(`${melody.melody1}_merchant_table`, (data) => {
            if (data.type === 'error') {
                console.error(data.message);
                return;
            }
            merchantDataTable(data);
        });
    };

    // Function to handle merchant table rendering
    function merchantDataTable(dataJSONArray) {
        reCreateMdataTable('afrobuild_merchant_data_table', 'afrobuild_merchant_data_table_div');

        $('.afrobuild_merchant_data_table').mDatatable({
            data: {
                type: 'local',
                source: dataJSONArray,
                pageSize: 10
            },
            search: { input: $('#afrobuild_merchant_general_search') },
            columns: [
                {
                    field: 'name',
                    title: "Merchant",
                    template: row => `${row.name}`.toUcwords()
                },
                {
                    field: 'email',
                    title: "Email",
                    template: row => row.email
                },
                {
                    field: 'phone',
                    title: "Phone",
                    template: row => row.phone
                },
                {
                    field: 'location',
                    title: "Location",
                    template: row => row.location
                },
                {
                    field: 'address',
                    title: "Address",
                    template: row => row.address
                },
                {
                    field: 'status',
                    title: "Status",
                    template: row => row.status === 'active'
                        ? `<span class="badge text-bg-success">Active</span>`
                        : `<span class="badge text-bg-danger">${row.status.toUcwords()}</span>`
                },
                {
                    field: 'action',
                    title: 'Action',
                    template: row => {
                        const statusBtn = row.status === "deactivated"
                            ? `<a href="#" class="dropdown-item afrobuild_merchant_table_edit_btn" data-getid="${row.merchantid}" data-getname="deactivate_merchant" data-getdata="${row.name.toUcwords()}" data-activate="activate"><i class="icon-checkmark3"></i> Reactivate</a>`
                            : `<a href="#" class="dropdown-item afrobuild_merchant_table_edit_btn" data-getid="${row.merchantid}" data-getname="deactivate_merchant" data-getdata="${row.name.toUcwords()}" data-activate="deactivate"><i class="icon-blocked"></i> Deactivate</a>`;

                        const deleteBtn = $('.hidden_delete_for_admin').val() === 'admin'
                            ? `<a href="#" class="dropdown-item afrobuild_merchant_table_edit_btn" data-getid="${row.merchantid}" data-getname="delete_merchant" data-getdata="${row.name.toUcwords()}"><i class="icon-close2"></i> Delete</a>`
                            : '';

                        return `
                            <div class="dropdown">
                                <a href="#" class="m-btn--icon-only" data-toggle="dropdown">
                                    <i class="icon-menu7" style="font-size:20px;color:grey;"></i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="afrobuild_merchant_table_edit_btn dropdown-item" href="#" data-getid="${row.merchantid}" data-getname="specific_merchant"><i class="icon-pencil"></i>Edit Details</a>
                                    ${statusBtn}
                                    ${deleteBtn}
                                </div>
                            </div>`;
                    }
                }
            ],
        });
    }

    // Update Merchant on Click
    $(document).on('click', '.afrobuild_merchant_table_edit_btn', function (e) {
        const action = $(this).data('getname');
        const merchantId = $(this).data('getid');
        const merchantname = $(this).data('getdata');
        const isActivate = $(this).data('activate'); // Checks if it's an 'activate' action

        // Specific Merchant Action
        if (action === 'specific_merchant') {
            socket.emit('specific', {
                "melody1": melody.melody1,
                "melody2": melody.melody2,
                "melody3": melody.melody3,
                "param": action,
                "dataId": merchantId
            });

            socket.on(`${melody.melody1}_specific_merchant`, (res) => {
                if (res.merchantResult) {
                    const html = ejs.render(renderMerchantForm(), {});
                    document.getElementById('afrobuild_merchant_page_form_display').innerHTML = html;
                    $('#afrobuild_manage_merchant_table_btn').html('View All Merchants');
                    $('#afrobuild_manage_merchant_table_btn').data('open', "table");
                    $('.merchant_submit_btn').html('Update');
                    populateMerchantForm(res.merchantResult);  // Populate the form with merchant data
                } else {
                    Swal.fire('Error', res.message || 'Error fetching merchant details', 'error');
                }
            });
        }

        // Deactivate or Activate Merchant Action
        if (action === 'deactivate_merchant' || action === 'activate_merchant') {
            const isActivating = isActivate === 'activate';
            const actionVerb = isActivating ? 'Reactivate' : 'Deactivate';
            const pastTenseVerb = isActivate === 'activate' ? 'reactivated' : 'deactivated';


            Swal.fire({
                title: `Are you sure you want to ${actionVerb} this merchant?`,
                text: `This will change the status of the merchant ${merchantname}.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: actionVerb,
                cancelButtonText: 'Cancel',
                reverseButtons: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    // Emit deactivate or activate action
                    socket.off('deactivate');
                    socket.off(`${melody.melody1}_${action}`);

                    socket.emit('deactivate', {
                        melody1: melody.melody1,
                        melody2: melody.melody2,
                        param: action,
                        dataId: merchantId,
                        checker: isActivate
                    });

                    socket.once(`${melody.melody1}_${action}`, (res) => {
                        Swal.fire({
                            title: res.type ? 'Success' : 'Error',
                            text: res.message || `Merchant ${pastTenseVerb} successfully!`,
                            icon: res.type ? 'success' : 'error',
                            showConfirmButton: true
                        });
                        merchantTableFetch();  // Refresh table after action
                    });
                }
            });

        }
    });


    // Function to populate the merchant form with data
    function populateMerchantForm(merchant) {
        $('#name').val(merchant.name);
        $('#email').val(merchant.email);
        $('#phone').val(merchant.phone);
        $('#location').val(merchant.location);
        $('#address').val(merchant.address);
        $('#merchant_hiddenid').val(merchant.merchantid);
        // If you need more fields, populate them here
    }
});
