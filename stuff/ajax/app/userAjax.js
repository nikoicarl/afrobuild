$(document).ready(function () {

    // VIEW ALL USER BUTTON
    $(document).on('click.pageopener', 'h3#afrobuild_manage_user_table_btn', function(e) {
        e.preventDefault();
        
        let open = $(this).data("open");
        if (open == 'table') {
            html = ejs.render(UserTable(), {});
            document.getElementById('afrobuild_user_page_form_display').innerHTML = html;
            $('#afrobuild_manage_user_table_btn').html(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left-circle"><circle cx="12" cy="12" r="10"></circle><polyline points="12 8 8 12 12 16"></polyline><line x1="16" y1="12" x2="8" y2="12"></line></svg>
                Go Back
            `);
            $('#afrobuild_manage_user_table_btn').data('open', "form");
            userTableFetch();
            makeAllSelectLiveSearch();
        } else {
            html = ejs.render(UserForm(), {});
            document.getElementById('afrobuild_user_page_form_display').innerHTML = html;
            $('#afrobuild_manage_user_table_btn').html('View All Users');
            $('#afrobuild_manage_user_table_btn').data('open', "table");
            departmentUserDropdown();
            employeeUserDropdown();
            makeAllSelectLiveSearch();
        }

    });


    //================================================================================//
    // FORM SUBMIT
        //User submit Form
        $(document).on('submit', 'form.afrobuild_manage_user_form', function (e) {
            e.preventDefault();

            //Get data from html
            let afrobuild_manage_user_employee = $('.afrobuild_manage_user_employee', this).val();
            let afrobuild_manage_user_username = $('.afrobuild_manage_user_username', this).val();
            let afrobuild_manage_user_password = $('.afrobuild_manage_user_password', this).val();
            let afrobuild_manage_user_confirm_password = $('.afrobuild_manage_user_confirm_password', this).val();
            let afrobuild_manage_user_hiddenid = $('.afrobuild_manage_user_hiddenid', this).val();

            //Setting submit button to loader
            $('.afrobuild_manage_user_submit_btn').html('<div class="mr-2 spinner-border align-self-center loader-sm"></div>');
            //Diable submit button
            $('.afrobuild_manage_user_submit_btn').attr('disabled', 'disabled');

            socket.off('insertNewUser');
            socket.off(melody.melody1+'_insertNewUser'); 

            setTimeout(function () {
                socket.emit('insertNewUser', {
                    "melody1": melody.melody1,
                    "melody2": melody.melody2,
                    "melody3": melody.melody3,
                    "afrobuild_manage_user_employee": afrobuild_manage_user_employee,
                    "afrobuild_manage_user_username": afrobuild_manage_user_username,
                    "afrobuild_manage_user_password": afrobuild_manage_user_password,
                    "afrobuild_manage_user_confirm_password": afrobuild_manage_user_confirm_password,
                    "afrobuild_manage_user_hiddenid": afrobuild_manage_user_hiddenid
                });
            }, 500);

            //Get response from submit
            socket.on(melody.melody1 + '_insertNewUser', function (data) {
                //Get json content from login code
                if (data.type == "error") {
                    //trigger alert using the alert function down there
                    swal({
                        title: 'Error',
                        text: data.message,
                        type: 'error',
                        padding: '1em'
                    })
                } else if (data.type == "caution") {
                    swal({
                        text: data.message,
                        type: 'warning',
                        padding: '1em'
                    })
                } else {
                    //trigger alert using the alert function down there
                    swal({
                        title: 'Success',
                        text: data.message,
                        type: 'success',
                        padding: '1em'
                    })
                    //Empty the form 
                    $('.afrobuild_manage_user_employee, .afrobuild_manage_user_username, .afrobuild_manage_user_password, .afrobuild_manage_user_confirm_password, .afrobuild_manage_user_hiddenid').val('').change();
                    socket.off(melody.melody1+'_insertNewUser'); 
                }
                //Set submit button back to its original text
                $('.afrobuild_manage_user_submit_btn').html('Submit');
                //Enable submit button
                $('.afrobuild_manage_user_submit_btn').removeAttr('disabled');
            });
        });

    //================================================================================//
    // TABLE FETCH
        // Table Fetch
        let userTableFetch = () => {
            socket.off('table');
            socket.off(melody.melody1+'_user_table'); 
            
            socket.emit('table', {
                melody1: melody.melody1,
                melody2: melody.melody2,
                param: 'user_table'
            });

            // User Table Emit Response
            socket.on(melody.melody1 + '_user_table', (data) => {
                if (data.type == 'error') {
                    console.log(data.message);
                } else {
                    if (data.length > 0) {
                        userDataTable(data);
                    } else {
                        userDataTable(data);
                    }
                }
            });
        }

        //Data table creation function
        function userDataTable(dataJSONArray) {
            reCreateMdataTable('afrobuild_user_data_table', 'afrobuild_user_data_table_div');
            const datatable = $('.afrobuild_user_data_table').mDatatable({
                data: {
                    type: 'local',
                    source: dataJSONArray,
                    pageSize: 10
                },
                search: {
                    input: $('#afrobuild_user_general_search'),
                },
                columns: [
                    {
                        field: 'first_name',
                        title: "Employee Name",
                        type: 'text',
                        template: function (row) {
                            return (row.first_name+ ' ' +row.other_name+ ' ' +row.last_name).toUcwords();
                        }
                    },
                    {
                        field: 'department',
                        title: "Department",
                        type: 'text',
                        template: function (row) {
                            return (row.department).toUcwords();
                        }
                    },
                    {
                        field: 'username',
                        title: "Username",
                        type: 'text',
                        template: function (row) {
                            return (row.username).toUcwords();
                        }
                    },
                    {
                        field: 'status',
                        title: "Status",
                        type: 'text',
                        template: function (row) {
                            return row.status == 'active' ? `<span class="badge badge-success"> Active </span>` : `<span class="badge badge-danger"> ${row.status.toUcwords()} </span>`;
                        }
                    },
                    {
                        field: 'action',
                        title: 'Action',
                        template: function (row) {
                            let activateOrDeactivate, validate_delete;
                    
                            if (row.status == "deactivated") {
                                activateOrDeactivate = `<a href="#" class="dropdown-item afrobuild_user_table_edit_btn" data-getid="${row.userid}" data-getname="deactivate_user" data-getdata="${row.username.toUcwords()}" data-activate="activate"><i class="icon-checkmark3"></i> Reactivate</a>`;
                            } else {
                                activateOrDeactivate = `<a href="#" class="dropdown-item afrobuild_user_table_edit_btn" data-getid="${row.userid}" data-getname="deactivate_user" data-getdata="${row.username.toUcwords()}" data-activate="deactivate"><i class="icon-blocked"></i> Deactivate</a>`;
                            }
                    
                            if ($('.hidden_delete_for_admin').val() == 'admin') {
                                validate_delete = `<a href="#" class="dropdown-item afrobuild_user_table_edit_btn" data-getid="${row.userid}" data-getname="delete_user" data-getdata="${row.username.toUcwords()}"><i class="icon-close2"></i> Delete</a>`;
                            } else {
                                validate_delete = '';
                            }
                    
                            return `
                                <div class="dropdown" > 
                                    <a href="#" class="  m-btn--icon m-btn--icon-only m-btn--pill" data-toggle="dropdown">
                                        <i class="icon-menu7" style="font-size:20px"></i>
                                    </a>
                                    <div class="dropdown-menu dropdown-menu-right">
                                    <a class="afrobuild_user_table_edit_btn dropdown-item" href="#" data-getid="`+ row.userid + `" data-getname="specific_user"><i class="icon-pencil"></i></i>Edit Details</a> 
                                    ${activateOrDeactivate}
                                        ${validate_delete}
                                    </div>
                                </div>
                            `;
                        }
                    },
                ],
            });
        }

    //================================================================================//
    // TABLE CLICK EVENTS
        //Function open edit form
        $(document).on("click.tablebtnclicks", "a.afrobuild_user_table_edit_btn", function(){

            if ($(this).data('activate')) {
                deactivate_activate = $(this).data('activate');
            }

            var dataId = $(this).data('getid');
            var getname = $(this).data('getname');
            let getdata = $(this).data('getdata');
            var thisElement = $(this);
            // console.log(dataId);

            //Check if button clicked is the delete or edit
            if (getname === "delete_user") {
                //Delete warning alert
                swal({
                    title: 'Are you sure?',
                    text: 'You want to delete '+(getdata)+ '?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, delete it!'
                }).then(function(result) {
                    //Check if yes is clicked
                    if (result.value) {
                        //Delete Item
                        if (deleteUser(getname, dataId, getdata)) {
                            //Result alert
                            swal(
                                'Deleted!',
                                'Item has been deleted.',
                                'success'
                            )
                        }
                    }
                });
            } else if (getname === "deactivate_user") {
                //Deactivate warning alert
                let mssg;
                if (deactivate_activate == "activate") {
                    mssg = 'Are you sure you want to reactivate '+getdata+ '?';
                } else {
                    mssg = 'Are you sure you want to deactivate '+getdata+ '?';
                }
                swal({
                    title: 'Caution!',
                    text: mssg,
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes'
                }).then(function(result) {
                    //Check if yes is clicked
                    if (result.value) {
                        //Delete Item
                        if (deactivateUser(getname, dataId, deactivate_activate)) {
                            let title; 
                            if (deactivate_activate == "activate") {
                                title = 'Reactivate successful';
                                mssg = 'is reactivated.';
                            } else {
                                title = 'Deactivate successful';
                                mssg = 'is deactivated.';
                            }
                            //Result alert
                            swal(
                                title,
                                getdata + ' ' + mssg,
                                'success'
                            )
                        }
                    }
                });
                
            } else {
                //Update data method
                updateUser(getname, dataId, thisElement);
            }
        });

        //Update Fetch function
        let holdDepartment, holdEmployee;
        function updateUser(getname, dataId, thisElement) {
            socket.off('specific');
            socket.off(melody.melody1+'_'+getname); 

            socket.emit('specific', {
                "melody1": melody.melody1,
                "melody2": melody.melody2,
                "melody3": melody.melody3,
                "param": getname,
                "dataId": dataId
            });

            socket.on(melody.melody1+'_'+getname, (data)=>{
                if (data.type == 'error') {
                    swal(
                        'Error',
                        data.message,
                        'warning'
                    )
                } else {
                    html = ejs.render(UserForm(), {});
                    document.getElementById('afrobuild_user_page_form_display').innerHTML = html;
                    $('#afrobuild_manage_user_table_btn').html('View All Users');
                    $('#afrobuild_manage_user_table_btn').data('open', "table");
                    thisElement.html('<div class="m-loader m-loader--white" style="width: 30px; display: inline-block;"></div>');
                    $('.afrobuild_manage_user_submit_btn').html('Update');
                    employeeUserDropdown();
                    departmentUserDropdown();
                    makeAllSelectLiveSearch();

                    if (data.employeeResult) {
                        let fullName;
                        fullName = data.employeeResult.first_name + ' ' + data.employeeResult.other_name + ' '+ data.employeeResult.last_name;
                        $('.afrobuild_manage_user_employee').val(data.employeeResult.employeeid).change();
                        holdEmployee = data.employeeResult.employeeid;
                        $('.afrobuild_manage_user_department').val(data.employeeResult.departmentid).change();
                        holdDepartment = data.employeeResult.departmentid;
                        $('.afrobuild_manage_user_username').val(data.userResult.username);
                        $('.afrobuild_manage_user_hiddenid').val(data.userResult.userid);
                        $('.afrobuild_manage_user_password').val('');
                        $('.afrobuild_manage_user_confirm_password').val('');
                    } else {
                        $('.afrobuild_manage_user_hiddenid').val('');
                        $('.afrobuild_manage_user_department').val('');
                        $('.afrobuild_manage_user_employee').val('');
                        $('.afrobuild_manage_user_username').val('');
                        $('.afrobuild_manage_user_password').val('');
                        $('.afrobuild_manage_user_confirm_password').val('');
                        swal(
                            'Oops!!',
                            'Fetching to edit ended up empty',
                            'warning'
                        )
                    }
                }
            });
        }

        // Deactivate Function
        function deactivateUser(getname, dataId, deactivate_activate) {
            socket.off('deactivate');
            socket.off(melody.melody1+'_'+getname); 

            socket.emit('deactivate', {
                melody1: melody.melody1,
                melody2: melody.melody2,
                param: getname,
                dataId: dataId,
                checker: deactivate_activate
            });

            //Response from deactivate
            socket.on(melody.melody1+'_'+getname, (data)=>{
                if (data['type'] == 'error') {
                    console.log(data['message']);
                    return false;
                } else if (data.type == "caution") {
                    swal({
                        text: data.message,
                        type: 'warning',
                        padding: '1em'
                    })
                    return false;
                } else {
                    userTableFetch();
                    return true;
                } 
            });
        }

        //Delete Fetch function
        function deleteUser(getname, dataId, getdata) {
            socket.off('delete');
            socket.off(melody.melody1+'_'+getname); 

            socket.emit('delete', {
                "melody1": melody.melody1,
                "melody2": melody.melody2,
                "param": getname,
                "dataId": dataId
            });

            //Response from delete
            socket.on(melody.melody1+'_'+getname, function(data){
                if (data.type == "error") {
                    console.log(data.message);
                } else if (data.type == "caution") {
                    swal({
                        text: data.message,
                        type: 'warning',
                        padding: '1em'
                    })
                } else{
                    Swal.fire(
                        'Deletion successful',
                        getdata.toUcwords() + ' has been deleted',
                        'success'
                    )
                    userTableFetch();
                }
            });
        }

    //================================================================================//
    // DROPDOWNS
        //departmentUserDropdown
        departmentUserDropdown();
        function departmentUserDropdown() {
            socket.off('dropdown');
            socket.off(melody.melody1 + '_department'); 

            socket.emit('dropdown', {
                melody1: melody.melody1,
                melody2: melody.melody2,
                param: "department"
            });

            //Get dropdown data
            socket.on(melody.melody1 + '_department', function (data) {
                //Get json content from login code
                if (data.type == "error") {
                    console.log(data.message);
                } else {
                    $('.afrobuild_manage_user_department').html(`<option value="" ${(holdDepartment !== undefined) ? '' : 'selected'}> Select Department </option>`);
                    data.forEach(item=>{
                        $('.afrobuild_manage_user_department').append(`<option value="${item.departmentid}" ${item.departmentid == holdDepartment ? 'selected' : ''}> ${item.name.toUcwords()} </option>`);
                    });
                }
                makeAllSelectLiveSearch('afrobuild_manage_user_department', 'Select Department')
            });
        }


        //Employee Dropdown
        employeeUserDropdown();
        function employeeUserDropdown() {
            socket.off('dropdown');
            socket.off(melody.melody1 + '_employee'); 

            socket.emit('dropdown', {
                melody1: melody.melody1,
                melody2: melody.melody2,
                param: "employee"
            });

            //Get dropdown data
            socket.on(melody.melody1 + '_employee', function (data) {
                //Get json content from login code
                if (data.type == "error") {
                    console.log(data.message);
                } else {
                    $('.afrobuild_manage_user_employee').html(`<option value="" ${holdEmployee !== undefined ? '' : 'selected'}>Select Employee </option>`);
                    data.forEach(item =>{
                        let fullname = item.first_name + ' ' + ((item.other_name == "" || item.other_name == undefined) ? '' : item.other_name) + ' ' + item.last_name;
                        $('.afrobuild_manage_user_employee').append(`<option value="${item.employeeid}" ${item.employeeid == holdEmployee ? 'selected' : ''}> ${fullname.toUcwords()} </option>`);
                    });
                }
                makeAllSelectLiveSearch('afrobuild_manage_user_employee', 'Select Employee')
            });
        }


        $(document).on('change.otherchange', 'select.afrobuild_manage_user_department', function(){
            socket.off(melody.melody1+'_department_employee'); 
            socket.off('dropdown');

            let value = $(this).val();
            if (value == "" || value == undefined) {
                employeeUserDropdown();
            } else {
                socket.emit('dropdown', {
                    melody1: melody.melody1,
                    melody2: melody.melody2,
                    param: 'department_employee',
                    value: value
                });
            }
            
            socket.on(melody.melody1+'_department_employee', (data)=>{
                if (data.type == 'error') {
                    console.log(data.message);
                } else {
                    $('.afrobuild_manage_user_employee').html(`<option value="" ${holdEmployee !== undefined ? '' : 'selected'}>Select Employee </option>`);
                    data.forEach(item =>{
                        let fullname = item.first_name + ' ' + item.other_name + ' ' + item.last_name;
                        $('.afrobuild_manage_user_employee').append(`<option value="${item.employeeid}" ${item.employeeid == holdEmployee ? 'selected' : ''}> ${fullname.toUcwords()} </option>`);
                    });
                }
                makeAllSelectLiveSearch('afrobuild_manage_user_employee', 'Select Employee')
            });
        });
        
        //Clear navigation loader
        clearNavigationLoader();

    //================================================================================//
    // BROADCAST EVENTS

        socket.on('userBroadcast', (data)=>{
            userTableFetch();
        });

        socket.on('departmentBroadcast', (data)=>{
            departmentUserDropdown();
        });

        socket.on('employeeBroadcast', (data)=>{
            employeeUserDropdown();
        });
});