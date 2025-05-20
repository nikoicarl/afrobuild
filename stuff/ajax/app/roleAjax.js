$(document).ready(function () {
    const socket = io();
    const $formDisplay = $('#afrobuild_role_page_form_display');
    const $toggleBtn = $('#afrobuild_manage_role_table_btn');
    const $roleForm = $('#roleForm');

    // Handle the toggle between table and form
    $(document).on('click.pageopener', 'h3#afrobuild_manage_role_table_btn', function (e) {
        e.preventDefault();
        const isTableView = $(this).data("open") === 'table';

        // Render the corresponding content based on the current state
        const html = isTableView ? ejs.render(RoleTable(), {}) : ejs.render(renderRoleForm(), {});
        $formDisplay.html(html);

        // Update the button text for toggling between views
        const btnText = isTableView
            ? `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M19 12H5"></path><path d="M12 5l-7 7 7 7"></path></svg> Go Back`
            : 'View All Roles';

        // Set the button data-toggle state for next interaction
        $toggleBtn.html(btnText).data('open', isTableView ? 'form' : 'table');

        // Fetch the role table if we are in table view
        if (isTableView) roleTableFetch();
    });

    // Handle role form submission for creating or updating a role
    $(document).on('click', '.afrobuild_manage_role_submit_btn', function (e) {
        e.preventDefault();  // Prevent the default action of the button

        const roleData = {
            name: $('#role_name').val().trim(),
            description: $('#role_description').val().trim(),
            role_hiddenid: $('#role_hiddenid').val().trim(),
            melody1: melody.melody1,
            melody2: melody.melody2
        };

        const $submitBtn = $('.afrobuild_manage_role_submit_btn')
            .html('<div class="spinner-border loader-sm" role="status"></div>')
            .attr('disabled', true);

        setTimeout(() => {
            // Determine if it's create or update action based on role_hiddenid
            const action = roleData.role_hiddenid ? 'update_role' : 'create_role';

            // Emit the respective socket event
            socket.emit('create_role', roleData);

            // Handle response based on action
            socket.once(`${roleData.melody1}_${'create_role'}`, (res) => {
                Swal.fire({
                    title: res.success ? 'Success' : 'Error',
                    text: res.message || (res.success ? `Role ${action === 'create_role' ? 'created' : 'updated'} successfully!` : `Failed to ${action === 'create_role' ? 'create' : 'update'} role.`),
                    icon: res.success ? 'success' : 'error',
                    showConfirmButton: !res.success,
                    timer: res.success ? 2000 : undefined
                });
                $submitBtn.html('Submit').removeAttr('disabled');

                // If successful, reset the form and clean up
                if (res.success) {
                    resetRoleForm();
                    roleTableFetch(); // Refresh the role table
                }
            });

            socket.on('error', (err) => {
                $submitBtn.html('Submit').removeAttr('disabled');
                Swal.fire('Error', 'An unexpected error occurred. Please try again later.', 'error');
            });
        }, 300);
    });

    // Function to reset the role form
    function resetRoleForm() {
        $('#roleForm')[0].reset();  // Reset the form fields
        $('#role_hiddenid').val('');  // Clear the hidden ID field
        $('.afrobuild_manage_role_submit_btn').html('Submit').removeAttr('disabled');  // Reset submit button text and enable
    }

    // Function to fetch and render the role table
    const roleTableFetch = () => {
        socket.off('table').off(`${melody.melody1}_role_table`);

        socket.emit('table', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: 'role_table'
        });

        socket.on(`${melody.melody1}_role_table`, (data) => {
            if (data.type === 'error') {
                console.error(data.message);
                return;
            }
            roleDataTable(data);
        });
    };

    // Function to handle role table rendering
    function roleDataTable(dataJSONArray) {
        reCreateMdataTable('afrobuild_role_data_table', 'afrobuild_role_data_table_div');

        $('.afrobuild_role_data_table').mDatatable({
            data: {
                type: 'local',
                source: dataJSONArray,
                pageSize: 10
            },
            search: { input: $('#afrobuild_role_general_search') },
            columns: [
                {
                    field: 'name',
                    title: "Role",
                    template: row => row.name.toUcwords()
                },
                {
                    field: 'description',
                    title: "Description",
                    template: row => row.description.toUcwords()
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
                            ? `<a href="#" class="dropdown-item afrobuild_role_table_edit_btn" data-getid="${row.roleid}" data-getname="deactivate_role" data-getdata="${row.name.toUcwords()}" data-activate="activate"><i class="icon-checkmark3"></i> Reactivate</a>`
                            : `<a href="#" class="dropdown-item afrobuild_role_table_edit_btn" data-getid="${row.roleid}" data-getname="deactivate_role" data-getdata="${row.name.toUcwords()}" data-activate="deactivate"><i class="icon-blocked"></i> Deactivate</a>`;

                        const deleteBtn = $('.hidden_delete_for_admin').val() === 'admin'
                            ? `<a href="#" class="dropdown-item afrobuild_role_table_edit_btn" data-getid="${row.roleid}" data-getname="delete_role" data-getdata="${row.name.toUcwords()}"><i class="icon-close2"></i> Delete</a>`
                            : '';

                        return `
                            <div class="dropdown">
                                <a href="#" class="m-btn--icon-only" data-toggle="dropdown">
                                    <i class="icon-menu7" style="font-size:20px;color:grey;"></i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="afrobuild_role_table_edit_btn dropdown-item" href="#" data-getid="${row.roleid}" data-getname="specific_role"><i class="icon-pencil"></i>Edit Details</a>
                                    ${statusBtn}
                                    ${deleteBtn}
                                </div>
                            </div>`;
                    }
                }
            ],
        });
    }

    // Update Role on Click
    $(document).on('click', '.afrobuild_role_table_edit_btn', function (e) {
        const action = $(this).data('getname');
        const roleId = $(this).data('getid');
        const roleName = $(this).data('getdata');
        const isActivate = $(this).data('activate'); // Checks if it's an 'activate' action

        // Specific Role Action
        if (action === 'specific_role') {
            socket.emit('specific', {
                "melody1": melody.melody1,
                "melody2": melody.melody2,
                "melody3": melody.melody3,
                "param": action,
                "dataId": roleId
            });

            socket.on(`${melody.melody1}_specific_role`, (res) => {
                if (res.roleResult) {
                    const html = ejs.render(renderRoleForm(), {});
                    document.getElementById('afrobuild_role_page_form_display').innerHTML = html;
                    $('#afrobuild_manage_role_table_btn').html('View All Roles');
                    $('#afrobuild_manage_role_table_btn').data('open', "table");
                    $('.role_submit_btn').html('Update');
                    populateRoleForm(res.roleResult);  // Populate the form with role data
                } else {
                    Swal.fire('Error', res.message || 'Error fetching role details', 'error');
                }
            });
        }

        // Deactivate or Activate Role Action
        if (action === 'deactivate_role' || action === 'activate_role') {
            const roleStatus = isActivate ? 'active' : 'deactivated';
            const actionText = isActivate ? 'Reactivate' : 'Deactivate';
            const confirmText = isActivate ? 'Reactivate' : 'Deactivate';

            Swal.fire({
                title: `Are you sure you want to ${actionText} the role "${roleName}"?`,
                showCancelButton: true,
                confirmButtonText: confirmText
            }).then((result) => {
                if (result.isConfirmed) {
                    socket.emit(`${action}`, {
                        roleId: roleId,
                        status: roleStatus
                    });

                    socket.once('role_update', (res) => {
                        Swal.fire({
                            title: res.success ? 'Success' : 'Error',
                            text: res.success ? `${actionText}d successfully!` : `Failed to ${actionText} role.`,
                            icon: res.success ? 'success' : 'error',
                            showConfirmButton: !res.success,
                            timer: res.success ? 2000 : undefined
                        });

                        // Refresh role table on success
                        if (res.success) roleTableFetch();
                    });
                }
            });
        }

        // Delete Role Action
        if (action === 'delete_role') {
            Swal.fire({
                title: 'Are you sure you want to delete this role?',
                text: `You will not be able to restore the role "${roleName}" once deleted.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                confirmButtonColor: '#d33'
            }).then((result) => {
                if (result.isConfirmed) {
                    socket.emit('delete_role', { roleId });

                    socket.once('role_deleted', (res) => {
                        Swal.fire({
                            title: res.success ? 'Success' : 'Error',
                            text: res.success ? `Role deleted successfully!` : `Failed to delete role.`,
                            icon: res.success ? 'success' : 'error',
                            showConfirmButton: !res.success,
                            timer: res.success ? 2000 : undefined
                        });

                        // Refresh role table on success
                        if (res.success) roleTableFetch();
                    });
                }
            });
        }
    });

    // Populate the role form for editing
    function populateRoleForm(role) {
        $('#role_hiddenid').val(role.roleid);
        $('#role_name').val(role.name);
        $('#role_description').val(role.description);
    }
});
