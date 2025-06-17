$(document).ready(function () {
    const socket = io();
    const $formDisplay = $('#afrobuild_user_page_form_display');
    const $toggleBtn = $('#afrobuild_manage_user_table_btn');
    const $userForm = $('#userForm');

    // Load user role dropdown
    loadUserRoleDropdown();

    // Handle form submission for role actions
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

        // Emit immediately, no timeout needed
        socket.emit('specific', actionData);

        socket.off(`${actionData.melody1}_specific_user_role`).on(`${actionData.melody1}_specific_user_role`, (res) => {
            $submitBtn.html('Submit').removeAttr('disabled');

            if (res && typeof res.success !== 'undefined') {
                Swal.fire({
                    title: res.success ? 'Success' : 'Error',
                    text: res.message || (res.success
                        ? `Role updated successfully.`
                        : `Failed to update role.`),
                    icon: res.success ? 'success' : 'error',
                    showConfirmButton: !res.success,
                    timer: res.success ? 2000 : undefined
                });

                if (res.success) {
                    // Reset form fields
                    $('.afrobuild_user_hiddenid').val('');
                    $('.afrobuild_user_role_select').val('');

                    userTableFetch(); // Refresh user table

                    // Close modal
                    $('.afrobuild_user_action_modal_close').trigger('click');
                }
            } else {
                Swal.fire('Error', 'Invalid response received from the server.', 'error');
            }
        });
    });

    // Handle the toggle between table and form
    $(document).on('click.pageopener', 'h3#afrobuild_manage_user_table_btn', function (e) {
        e.preventDefault();
        const isTableView = $(this).data("open") === 'table';

        // Render corresponding content
        const html = isTableView ? ejs.render(UserTable(), {}) : ejs.render(renderUserForm(), {});
        $formDisplay.html(html);

        // Update button text and data attribute
        const btnText = isTableView
            ? `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M19 12H5"></path><path d="M12 5l-7 7 7 7"></path></svg> Go Back`
            : 'View All Users';

        $toggleBtn.html(btnText).data('open', isTableView ? 'form' : 'table');

        if (isTableView) userTableFetch();
    });

    // Handle user form submission (create/update)
    $(document).on('click', '.afrobuild_manage_user_submit_btn', function (e) {
        e.preventDefault();

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

        const $submitBtn = $(this)
            .html('<div class="spinner-border loader-sm" role="status"></div>')
            .attr('disabled', true);

        // Determine create or update action
        const action = userData.user_hiddenid ? 'update_user' : 'create_user';

        // Emit 'create_user' event regardless since backend likely handles create/update by presence of user_hiddenid
        socket.emit('create_user', userData);

        socket.off(`${userData.melody1}_create_user`).on(`${userData.melody1}_create_user`, (res) => {
            Swal.fire({
                title: res.success ? 'Success' : 'Error',
                text: res.message || (res.success ? `User ${action === 'create_user' ? 'created' : 'updated'} successfully!` : `Failed to ${action === 'create_user' ? 'create' : 'update'} user.`),
                icon: res.success ? 'success' : 'error',
                showConfirmButton: !res.success,
                timer: res.success ? 2000 : undefined
            });
            $submitBtn.html('Submit').removeAttr('disabled');

            if (res.success) {
                resetUserForm();
                userTableFetch();
            }
        });
    });

    // Reset user form function
    function resetUserForm() {
        $('#userForm')[0].reset();
        $('#user_hiddenid').val('');
        $('.afrobuild_manage_user_submit_btn').html('Submit').removeAttr('disabled');
    }

    // Fetch and render user table
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

    // Render user data table
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
                    field: 'role_name',
                    title: "Role",
                    template: row => row.role_name.toUcwords()
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

    // Handle user table edit button clicks
    $(document).on('click', '.afrobuild_user_table_edit_btn', function (e) {
        e.preventDefault();

        const action = $(this).data('getname');
        const userId = $(this).data('getid');
        const username = $(this).data('getdata');
        const isActivate = $(this).data('activate'); // 'activate' or 'deactivate'

        if (action === 'specific_user') {
            socket.emit('specific', {
                melody1: melody.melody1,
                melody2: melody.melody2,
                melody3: melody.melody3,
                param: action,
                dataId: userId
            });

            socket.off(`${melody.melody1}_specific_user`).on(`${melody.melody1}_specific_user`, (res) => {
                if (res.userResult) {
                    const html = ejs.render(renderUserForm(), {});
                    $formDisplay.html(html);
                    $toggleBtn.html('View All Users').data('open', "table");
                    $('.user_submit_btn').html('Update');
                    populateUserForm(res.userResult);
                } else {
                    Swal.fire('Error', res.message || 'Error fetching user details', 'error');
                }
            });
        }

        if (action === 'deactivate_user' || action === 'activate_user') {
            const isActivating = isActivate === 'activate';
            const actionVerb = isActivating ? 'Reactivate' : 'Deactivate';
            const pastTenseVerb = isActivating ? 'reactivated' : 'deactivated';

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
                        userTableFetch();
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

    // Populate user form fields
    function populateUserForm(user) {
        $('#first_name').val(user.first_name);
        $('#last_name').val(user.last_name);
        $('#email').val(user.email);
        $('#phone').val(user.phone);
        $('#address').val(user.address);
        $('#username').val(user.username);
        $('#user_hiddenid').val(user.userid);
    }

    // Load user role dropdown
    function loadUserRoleDropdown() {
        socket.emit('dropdown', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: "user_role"
        });

        socket.off(`${melody.melody1}_user_role`).on(`${melody.melody1}_user_role`, function (data) {
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
        });
    }

    // Global socket error handler
    socket.on('error', (err) => {
        Swal.fire('Error', 'An unexpected error occurred. Please try again later.', 'error');
        $('.afrobuild_user_action_submit_btn, .afrobuild_manage_user_submit_btn').html('Submit').removeAttr('disabled');
    });
});
