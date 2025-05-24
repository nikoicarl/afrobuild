$(document).ready(function () {
    const socket = io();
    const $formDisplay = $('#afrobuild_vendor_page_form_display');
    const $toggleBtn = $('#afrobuild_manage_vendor_table_btn');
    const $vendorForm = $('#vendorForm');

    // Handle the toggle between table and form
    $(document).on('click.pageopener', 'h3#afrobuild_manage_vendor_table_btn', function (e) {
        e.preventDefault();
        const isTableView = $(this).data("open") === 'table';

        // Render the corresponding content based on the current state
        const html = isTableView ? ejs.render(VendorTable(), {}) : ejs.render(renderVendorForm(), {});
        $formDisplay.html(html);

        // Update the button text for toggling between views
        const btnText = isTableView
            ? `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M19 12H5"></path><path d="M12 5l-7 7 7 7"></path></svg> Go Back`
            : 'View All Vendors';

        // Set the button data-toggle state for next interaction
        $toggleBtn.html(btnText).data('open', isTableView ? 'form' : 'table');

        // Fetch the vendor table if we are in table view
        if (isTableView) vendorTableFetch();
    });

    // Handle vendor form submission for creating or updating a vendor
    $(document).on('click', '.afrobuild_manage_vendor_submit_btn', function (e) {
        e.preventDefault();  // Prevent the default action of the button

        const vendorData = {
            name: $('#name').val().trim(),
            email: $('#email').val().trim(),
            phone: $('#phone').val().trim(),
            location: $('#location').val().trim(),
            address: $('#address').val().trim(),
            vendor_hiddenid: $('#vendor_hiddenid').val().trim(),
            melody1: melody.melody1,
            melody2: melody.melody2
        };

        const $submitBtn = $('.afrobuild_manage_vendor_submit_btn')
            .html('<div class="spinner-border loader-sm" role="status"></div>')
            .attr('disabled', true);

        setTimeout(() => {
            // Determine if it's create or update action based on vendor_hiddenid
            const action = vendorData.vendor_hiddenid ? 'update_vendor' : 'create_vendor';

            // Emit the respective socket event
            socket.emit('create_vendor', vendorData);

            // Handle response based on action
            socket.once(`${vendorData.melody1}_${'create_vendor'}`, (res) => {
                Swal.fire({
                    title: res.success ? 'Success' : 'Error',
                    text: res.message || (res.success ? `Vendor ${action === 'create_vendor' ? 'created' : 'updated'} successfully!` : `Failed to ${action === 'create_vendor' ? 'create' : 'update'} vendor.`),
                    icon: res.success ? 'success' : 'error',
                    showConfirmButton: !res.success,
                    timer: res.success ? 2000 : undefined
                });
                $submitBtn.html('Submit').removeAttr('disabled');

                // If successful, reset the form and clean up
                if (res.success) {
                    resetVendorForm();
                    vendorTableFetch(); // Refresh the vendor table
                }
            });

            socket.on('error', (err) => {
                $submitBtn.html('Submit').removeAttr('disabled');
                Swal.fire('Error', 'An unexpected error occurred. Please try again later.', 'error');
            });
        }, 300);
    });


    function resetVendorForm() {
        $('#vendorForm')[0].reset();  // Reset the form fields
        $('#vendor_hiddenid').val('');  // Clear the hidden ID field
        $('.afrobuild_manage_vendor_submit_btn').html('Submit').removeAttr('disabled');  // Reset submit button text and enable
    }

    // Function to fetch and render the vendor table
    const vendorTableFetch = () => {
        socket.off('table').off(`${melody.melody1}_vendor_table`);

        socket.emit('table', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: 'vendor_table'
        });

        socket.on(`${melody.melody1}_vendor_table`, (data) => {
            if (data.type === 'error') {
                console.error(data.message);
                return;
            }
            vendorDataTable(data);
        });
    };

    // Function to handle vendor table rendering
    function vendorDataTable(dataJSONArray) {
        reCreateMdataTable('afrobuild_vendor_data_table', 'afrobuild_vendor_data_table_div');

        $('.afrobuild_vendor_data_table').mDatatable({
            data: {
                type: 'local',
                source: dataJSONArray,
                pageSize: 10
            },
            search: { input: $('#afrobuild_vendor_general_search') },
            columns: [
                {
                    field: 'name',
                    title: "Vendor",
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
                            ? `<a href="#" class="dropdown-item afrobuild_vendor_table_edit_btn" data-getid="${row.vendorid}" data-getname="deactivate_vendor" data-getdata="${row.name.toUcwords()}" data-activate="activate"><i class="icon-checkmark3"></i> Reactivate</a>`
                            : `<a href="#" class="dropdown-item afrobuild_vendor_table_edit_btn" data-getid="${row.vendorid}" data-getname="deactivate_vendor" data-getdata="${row.name.toUcwords()}" data-activate="deactivate"><i class="icon-blocked"></i> Deactivate</a>`;

                        const deleteBtn = $('.hidden_delete_for_admin').val() === 'admin'
                            ? `<a href="#" class="dropdown-item afrobuild_vendor_table_edit_btn" data-getid="${row.vendorid}" data-getname="delete_vendor" data-getdata="${row.name.toUcwords()}"><i class="icon-close2"></i> Delete</a>`
                            : '';

                        return `
                            <div class="dropdown">
                                <a href="#" class="m-btn--icon-only" data-toggle="dropdown">
                                    <i class="icon-menu7" style="font-size:20px;color:grey;"></i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="afrobuild_vendor_table_edit_btn dropdown-item" href="#" data-getid="${row.vendorid}" data-getname="specific_vendor"><i class="icon-pencil"></i>Edit Details</a>
                                    ${statusBtn}
                                    ${deleteBtn}
                                </div>
                            </div>`;
                    }
                }
            ],
        });
    }

    // Update Vendor on Click
    $(document).on('click', '.afrobuild_vendor_table_edit_btn', function (e) {
        const action = $(this).data('getname');
        const vendorId = $(this).data('getid');
        const vendorname = $(this).data('getdata');
        const isActivate = $(this).data('activate'); // Checks if it's an 'activate' action

        // Specific Vendor Action
        if (action === 'specific_vendor') {
            socket.emit('specific', {
                "melody1": melody.melody1,
                "melody2": melody.melody2,
                "melody3": melody.melody3,
                "param": action,
                "dataId": vendorId
            });

            socket.on(`${melody.melody1}_specific_vendor`, (res) => {
                if (res.vendorResult) {
                    const html = ejs.render(renderVendorForm(), {});
                    document.getElementById('afrobuild_vendor_page_form_display').innerHTML = html;
                    $('#afrobuild_manage_vendor_table_btn').html('View All Vendors');
                    $('#afrobuild_manage_vendor_table_btn').data('open', "table");
                    $('.vendor_submit_btn').html('Update');
                    populateVendorForm(res.vendorResult);  // Populate the form with vendor data
                } else {
                    Swal.fire('Error', res.message || 'Error fetching vendor details', 'error');
                }
            });
        }

        // Deactivate or Activate Vendor Action
        if (action === 'deactivate_vendor' || action === 'activate_vendor') {
            const isActivating = isActivate === 'activate';
            const actionVerb = isActivating ? 'Reactivate' : 'Deactivate';
            const pastTenseVerb = isActivate === 'activate' ? 'reactivated' : 'deactivated';


            Swal.fire({
                title: `Are you sure you want to ${actionVerb} this vendor?`,
                text: `This will change the status of the vendor ${vendorname}.`,
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
                        dataId: vendorId,
                        checker: isActivate
                    });

                    socket.once(`${melody.melody1}_${action}`, (res) => {
                        Swal.fire({
                            title: res.type ? 'Success' : 'Error',
                            text: res.message || `Vendor ${pastTenseVerb} successfully!`,
                            icon: res.type ? 'success' : 'error',
                            showConfirmButton: true
                        });
                        vendorTableFetch();  // Refresh table after action
                    });
                }
            });

        }
    });


    // Function to populate the vendor form with data
    function populateVendorForm(vendor) {
        $('#name').val(vendor.name);
        $('#email').val(vendor.email);
        $('#phone').val(vendor.phone);
        $('#location').val(vendor.location);
        $('#address').val(vendor.address);
        $('#vendor_hiddenid').val(vendor.vendorid);
        // If you need more fields, populate them here
    }
});
