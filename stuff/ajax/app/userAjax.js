// user-management.js

$(document).ready(function () {
    const socket = io();

    const $formDisplay = $('#afrobuild_user_page_form_display');
    const $toggleBtn = $('#afrobuild_manage_user_table_btn');
    const $userForm = $('#userForm');

    $(document).on('click.pageopener', 'h3#afrobuild_manage_user_table_btn', function (e) {
        e.preventDefault();
        const isTableView = $(this).data("open") === 'table';
        const html = isTableView ? ejs.render(UserTable(), {}) : ejs.render(UserForm(), {});
        $formDisplay.html(html);

        const btnText = isTableView 
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" ...></svg> Go Back`
            : 'View All Users';

        $toggleBtn.html(btnText).data('open', isTableView ? 'form' : 'table');
        if (isTableView) userTableFetch();
    });

    $userForm.submit(function (e) {
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

        const $submitBtn = $('.user_submit_btn').html('<div class="spinner-border loader-sm" role="status"></div>').attr('disabled', true);

        setTimeout(() => {
            socket.emit('create_user', userData);

            socket.once(`${userData.melody1}_create_user`, (res) => {
                Swal.fire({
                    title: res.success ? 'Success' : 'Error',
                    text: res.message || (res.success ? 'User created successfully!' : 'Failed to create user.'),
                    icon: res.success ? 'success' : 'error',
                    showConfirmButton: !res.success,
                    timer: res.success ? 2000 : undefined
                });

                if (res.success) $userForm[0].reset();
                $submitBtn.html('Submit').removeAttr('disabled');
            });
        }, 300);
    });

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
                        ? `<span class="badge badge-success">Active</span>`
                        : `<span class="badge badge-danger">${row.status.toUcwords()}</span>`
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
                                    <i class="icon-menu7" style="font-size:20px"></i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="afrobuild_user_table_edit_btn dropdown-item" href="#" data-getid="${row.userid}" data-getname="specific_user"><i class="icon-pencil"></i>Edit Details</a>
                                    ${statusBtn}
                                    ${deleteBtn}
                                </div>
                            </div>`;
                    }
                }
            ],
        });
    }

    function updateUser(getname, dataId, $element) {
        socket.off('specific').off(`${melody.melody1}_${getname}`);

        socket.emit('specific', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            melody3: melody.melody3,
            param: getname,
            dataId: dataId
        });

        socket.on(`${melody.melody1}_${getname}`, (data) => {
            if (data.type === 'error') {
                return Swal.fire('Error', data.message, 'warning');
            }

            const html = ejs.render(UserForm(), {});
            $('#afrobuild_user_page_form_display').html(html);
            $('#afrobuild_manage_user_table_btn').html('View All Users').data('open', 'table');
            $element.html('<div class="m-loader m-loader--white" style="width: 30px;"></div>');
            $('.afrobuild_manage_user_submit_btn').html('Update');

            if (!data || !data.userid) {
                return Swal.fire('Oops!', 'Fetching to edit ended up empty', 'warning');
            }
        });
    }

    function deactivateUser(getname, dataId, action) {
        socket.off('deactivate').off(`${melody.melody1}_${getname}`);

        socket.emit('deactivate', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: getname,
            dataId,
            checker: action
        });

        socket.on(`${melody.melody1}_${getname}`, (data) => {
            if (data.type === 'error' || data.type === 'caution') {
                Swal.fire({
                    text: data.message,
                    icon: data.type === 'error' ? 'error' : 'warning',
                    padding: '1em'
                });
                return;
            }
            userTableFetch();
        });
    }

    function deleteUser(getname, dataId, username) {
        socket.off('delete').off(`${melody.melody1}_${getname}`);

        socket.emit('delete', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: getname,
            dataId
        });

        socket.on(`${melody.melody1}_${getname}`, (data) => {
            if (data.type === 'error' || data.type === 'caution') {
                Swal.fire({
                    text: data.message,
                    icon: data.type === 'error' ? 'error' : 'warning',
                    padding: '1em'
                });
                return;
            }

            Swal.fire('Deletion Successful', `${username.toUcwords()} has been deleted`, 'success');
            userTableFetch();
        });
    }
});
