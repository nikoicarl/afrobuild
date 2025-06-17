$(document).ready(function () {
    const socket = io();
    const $formDisplay = $('#afrobuild_user_page_form_display');
    const $toggleBtn = $('#afrobuild_manage_user_table_btn');
    const $userForm = $('#userForm');

    // Load user role dropdown
    loadUserRoleDropdown();


    // Handle form submission for transaction actions
    $(document).on('click', '.afrobuild_user_action_submit_btn', function (e) {
        e.preventDefault();

        const actionData = {
            dataId: $('.afrobuild_user_hiddenid').val().trim(),
            role: $('.afrobuild_user_role_select').val().trim(),
            param: 'specific_user_role',
            melody1: melody.melody1,
            melody2: melody.melody2
        };

        const $submitBtn = $(this)
            .html('<div class="spinner-border loader-sm" role="status"></div>')
            .attr('disabled', true);

        setTimeout(() => {
            socket.emit('specific', actionData);

            socket.once(`${actionData.melody1}_specific_user_role`, (res) => {
                $submitBtn.html('Submit').removeAttr('disabled');

                if (res && typeof res.success !== 'undefined') {
                    Swal.fire({
                        title: res.success ? 'Success' : 'Error',
                        text: res.message || (res.success
                            ? `Role ${actionData.action.replace(/_/g, ' ')} successfully.`
                            : `Failed to ${actionData.action.replace(/_/g, ' ')} Role.`),
                        icon: res.success ? 'success' : 'error',
                        showConfirmButton: !res.success,
                        timer: res.success ? 2000 : undefined
                    });

                    if (res.success) {

                        // Reset the form fields
                        $('.afrobuild_user_hiddenid').val('');
                        $('.afrobuild_user_role_select').change(function () {
                            $(this).val('');
                        });

                        // Optionally close the modal (if desired)
                        $('#afrobuild_user_action_modal').modal('hide');
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

    // Handle the toggle between table and form
    $(document).on('click.pageopener', 'h3#afrobuild_manage_user_table_btn', function (e) {
        e.preventDefault();
        const isTableView = $(this).data("open") === 'table';

        // Render the corresponding content based on the current state
        const html = isTableView ? ejs.render(UserTable(), {}) : ejs.render(renderUserForm(), {});
        $formDisplay.html(html);

        // Update the button text for toggling between views
        const btnText = isTableView
            ? `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M19 12H5"></path><path d="M12 5l-7 7 7 7"></path></svg> Go Back`
            : 'View All Users';

        // Set the button data-toggle state for next interaction
        $toggleBtn.html(btnText).data('open', isTableView ? 'form' : 'table');

        // Fetch the user table if we are in table view
        if (isTableView) userTableFetch();
    });

    // Handle user form submission for creating or updating a user
    $(document).on('click', '.afrobuild_manage_user_submit_btn', function (e) {
        e.preventDefault();  // Prevent the default action of the button

        const userData = {
            first_name: $('#first_name').val().trim(),
            last_name: $('#last_name').val().trim(),
            email: $('#email').val().trim(),
            phone: $('#phone').val().trim(),
            address: $('#address').val().trim(),
            username: $('#username').val().trim(),
            password: $('#password').val().trim(),
            confirm_password: $('#confirm_password').val().trim(),
            user_hiddenid: $('#user_hiddenid').val().trim(),
            melody1: melody.melody1,
            melody2: melody.melody2
        };

        const $submitBtn = $('.afrobuild_manage_user_submit_btn')
            .html('<div class="spinner-border loader-sm" role="status"></div>')
            .attr('disabled', true);

        setTimeout(() => {
            // Determine if it's create or update action based on user_hiddenid
            const action = userData.user_hiddenid ? 'update_user' : 'create_user';

            // Emit the respective socket event
            socket.emit('create_user', userData);

            // Handle response based on action
            socket.once(`${userData.melody1}_${'create_user'}`, (res) => {
                Swal.fire({
                    title: res.success ? 'Success' : 'Error',
                    text: res.message || (res.success ? `User ${action === 'create_user' ? 'created' : 'updated'} successfully!` : `Failed to ${action === 'create_user' ? 'create' : 'update'} user.`),
                    icon: res.success ? 'success' : 'error',
                    showConfirmButton: !res.success,
                    timer: res.success ? 2000 : undefined
                });
                $submitBtn.html('Submit').removeAttr('disabled');

                // If successful, reset the form and clean up
                if (res.success) {
                    resetUserForm();
                    userTableFetch(); // Refresh the user table
                }
            });

            socket.on('error', (err) => {
                $submitBtn.html('Submit').removeAttr('disabled');
                Swal.fire('Error', 'An unexpected error occurred. Please try again later.', 'error');
            });
        }, 300);
    });


    function resetUserForm() {
        $('#userForm')[0].reset();  // Reset the form fields
        $('#user_hiddenid').val('');  // Clear the hidden ID field
        $('.afrobuild_manage_user_submit_btn').html('Submit').removeAttr('disabled');  // Reset submit button text and enable
    }

    // Function to fetch and render the user table
    const userTableFetch = () => {
        socket.off('table').off(`${melody.melody1}_user_table`);

        socket.emit('table', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: 'user_table'
        });

        socket.on(`${melody.melody1}_user_table`, (data) => {
            if (data.type === 'error') {
                console.error(data.message);
                return;
            }
            userDataTable(data);
        });
    };

    // Function to handle user table rendering
    function userDataTable(dataJSONArray) {
        reCreateMdataTable('afrobuild_user_data_table', 'afrobuild_user_data_table_div');

        $('.afrobuild_user_data_table').mDatatable({
            data: {
                type: 'local',
                source: dataJSONArray,
                pageSize: 10
            },
            search: { input: $('#afrobuild_user_general_search') },
            columns: [
                {
                    field: 'first_name',
                    title: "User",
                    template: row => `${row.first_name} ${row.last_name}`.toUcwords()
                },
                {
                    field: 'username',
                    title: "Username",
                    template: row => row.username.toUcwords()
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
                            ? `<a href="#" class="dropdown-item afrobuild_user_table_edit_btn" data-getid="${row.userid}" data-getname="deactivate_user" data-getdata="${row.username.toUcwords()}" data-activate="activate"><i class="icon-checkmark3"></i> Reactivate</a>`
                            : `<a href="#" class="dropdown-item afrobuild_user_table_edit_btn" data-getid="${row.userid}" data-getname="deactivate_user" data-getdata="${row.username.toUcwords()}" data-activate="deactivate"><i class="icon-blocked"></i> Deactivate</a>`;

                        const deleteBtn = $('.hidden_delete_for_admin').val() === 'admin'
                            ? `<a href="#" class="dropdown-item afrobuild_user_table_edit_btn" data-getid="${row.userid}" data-getname="delete_user" data-getdata="${row.username.toUcwords()}"><i class="icon-close2"></i> Delete</a>`
                            : '';

                        return `
                            <div class="dropdown">
                                <a href="#" class="m-btn--icon-only" data-toggle="dropdown">
                                    <i class="icon-menu7" style="font-size:20px;color:grey;"></i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="afrobuild_user_table_edit_btn dropdown-item" href="#" data-getid="${row.userid}" data-getname="set_user_role" data-getdata="${row.username.toUcwords()}"><i class="icon-user"></i>&nbspSet Role</a>
                                    <a class="afrobuild_user_table_edit_btn dropdown-item" href="#" data-getid="${row.userid}" data-getname="specific_user"><i class="icon-pencil"></i>&nbspEdit Details</a>
                                    ${statusBtn}
                                    ${deleteBtn}
                                </div>
                            </div>`;
                    }
                }
            ],
        });
    }

    // Update User on Click
    $(document).on('click', '.afrobuild_user_table_edit_btn', function (e) {
        const action = $(this).data('getname');
        const userId = $(this).data('getid');
        const username = $(this).data('getdata');
        const isActivate = $(this).data('activate'); // Checks if it's an 'activate' action

        // Specific User Action
        if (action === 'specific_user') {
            socket.emit('specific', {
                "melody1": melody.melody1,
                "melody2": melody.melody2,
                "melody3": melody.melody3,
                "param": action,
                "dataId": userId
            });

            socket.on(`${melody.melody1}_specific_user`, (res) => {
                if (res.userResult) {
                    const html = ejs.render(renderUserForm(), {});
                    document.getElementById('afrobuild_user_page_form_display').innerHTML = html;
                    $('#afrobuild_manage_user_table_btn').html('View All Users');
                    $('#afrobuild_manage_user_table_btn').data('open', "table");
                    $('.user_submit_btn').html('Update');
                    populateUserForm(res.userResult);  // Populate the form with user data
                } else {
                    Swal.fire('Error', res.message || 'Error fetching user details', 'error');
                }
            });
        }

        // Deactivate or Activate User Action
        if (action === 'deactivate_user' || action === 'activate_user') {
            const isActivating = isActivate === 'activate';
            const actionVerb = isActivating ? 'Reactivate' : 'Deactivate';
            const pastTenseVerb = isActivate === 'activate' ? 'reactivated' : 'deactivated';


            Swal.fire({
                title: `Are you sure you want to ${actionVerb} this user?`,
                text: `This will change the status of the user ${username}.`,
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
                        dataId: userId,
                        checker: isActivate
                    });

                    socket.once(`${melody.melody1}_${action}`, (res) => {
                        Swal.fire({
                            title: res.type ? 'Success' : 'Error',
                            text: res.message || `User ${pastTenseVerb} successfully!`,
                            icon: res.type ? 'success' : 'error',
                            showConfirmButton: true
                        });
                        userTableFetch();  // Refresh table after action
                    });
                }
            });

        }

        if (action === 'set_user_role') {
            const viewModal = $('.afrobuild_user_action_modal');
            viewModal.find('.modal-header .modal-title').text(`Set Role for ${username}`);
            viewModal.find('.afrobuild_user_hiddenid').val(userId);

            viewModal.trigger('click');

        }
    });


    // Function to populate the user form with data
    function populateUserForm(user) {
        $('#first_name').val(user.first_name);
        $('#last_name').val(user.last_name);
        $('#email').val(user.email);
        $('#phone').val(user.phone);
        $('#address').val(user.address);
        $('#username').val(user.username);
        $('#user_hiddenid').val(user.userid);
        // If you need more fields, populate them here
    }


    // Load dropdown
    function loadUserRoleDropdown() {
        socket.emit('dropdown', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: "user_role"
        });

        socket.on(`${melody.melody1}_user_role`, function (data) {
            const $select = $('.afrobuild_user_role_select');
            $select.html(`<option value="" selected>Select Role</option>`);

            if (data.type === "error") {
                console.warn(data.message);
                return;
            }

            data.forEach(item => {
                const optionValue = `${item.roleid}`;
                $select.append(`<option value="${optionValue}">${item.name.toUcwords()}</option>`);
            });

            // makeAllSelectLiveSearch('afrobuild_user_role_select', 'Select Role');
        });
    }
});
