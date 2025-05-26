(() => {

    //================================================================================//
    // FORM SUBMIT

    //Set privilege
    $(document).on('click.otherclicks', 'input.checkBox', function () {
        let columnName = $(this).data("column");
        let user_privilege = $('.afrobuild_privilege_user').val();
        let group_privilege = $('.afrobuild_privilege_group').val();
        let category = $(this).data('category');
        let table = $(this).data('table');
        let dataValue, begin_mssg, add_mssg, main_mssg;
        let thisChecker = $(this);

        if ($(this).is(':checked')) {
            dataValue = "yes";
            begin_mssg = "Enabling";
            add_mssg = "will make a user or group";
        } else {
            dataValue = "no";
            begin_mssg = "Disabling";
            add_mssg = "will make the user or group unable to";
        }

        $('.' + category).prop('checked', true);

        let title = columnName.replace(/_/g, ' ');
        let splitData = columnName.split('_');
        if (splitData[0] == 'update') {
            main_mssg = begin_mssg + " '" + title.toUpperCase() + "' privilege " + add_mssg + " update contents";
        } else if (splitData[0] == 'deactivate') {
            main_mssg = begin_mssg + " '" + title.toUpperCase() + "' privilege " + add_mssg + " deactivate records from this functionality";
        } else if (splitData[0] == 'func') {
            main_mssg = begin_mssg + " '" + title.toUpperCase() + "' privilege " + add_mssg + " see all related functionalities under this function";
        } else {
            main_mssg = begin_mssg + " '" + title.toUpperCase() + "' privilege " + add_mssg + " create or add new records";
        }

        swal.fire({
            title: 'Caution',
            text: main_mssg,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then(function (result) {
            if (result.value) {
                singleCheckbox(table, columnName, category, dataValue, user_privilege, group_privilege);
            } else {
                if ($('.' + columnName).is(':checked')) {
                    $('.' + columnName).prop('checked', false);
                    $('.' + category).prop('checked', false);
                } else {
                    $('.' + columnName).prop('checked', true);
                    $('.' + category).prop('checked', true);
                }
            }
        });
    });

    function singleCheckbox(table, columnName, category, dataValue, user_privilege, group_privilege) {
        socket.emit('privilege', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            table: table,
            columnName: columnName,
            dataValue: dataValue,
            category: category,
            user: user_privilege,
            group: group_privilege,
            param: 'set_one_privilege'
        });

        socket.on(melody.melody1 + '_set_one_privilege', (data) => {
            if (data.type == "error") {
                if ($('.' + columnName).is(':checked')) {
                    $('.' + columnName).prop('checked', false);
                    $('.' + category).prop('checked', false);
                } else {
                    $('.' + columnName).prop('checked', true);
                    $('.' + category).prop('checked', true);
                }
                swal.fire({
                    title: 'Warning',
                    text: data['message'],
                    icon: 'warning'
                });
            } else {
                reArrangeSideBar(user_privilege);
            }
        });
    }

    $(document).on('click.otherclicks', 'input.checkBoxAll', function () {
        let column = $(this).data('column');
        let user = $('.afrobuild_privilege_user').val();
        let group = $('.afrobuild_privilege_group').val();
        let table = $(this).data('table');
        let dataValue = "yes", mssg;

        if ($(this).is(':checked')) {
            if (column == "functions") {
                mssg = `Enabling this will make all functionalities visible to a User or Group`;
            } else {
                mssg = `Enabling this will allow a User or Group to add new records, update records and deactivate records from the various functionalities checked`;
            }
        } else {
            dataValue = "no";
            if (column == "functions") {
                mssg = `Disabling this will make all functionalities invisible to a User or Group`;
            } else {
                mssg = `Disabling this will make User or group unable to add new records, update records and deactivate records from the various functionalities checked`;
            }
        }

        swal.fire({
            title: 'Caution',
            text: mssg,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then(function (result) {
            if (result.value) {
                checkUncheckAll(column, dataValue);
                activateDeactivateCheckbox(table, column, group, user, dataValue);
            } else {
                if ($('.' + column).is(':checked')) {
                    $('.' + column).prop('checked', false);
                } else {
                    $('.' + column).prop('checked', true);
                }
            }
        });
    });

    function activateDeactivateCheckbox(table, column, group, user, dataValue) {
        socket.emit('privilege', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: "set_all_privilege",
            table: table,
            role: group,
            user: user,
            dataValue: dataValue
        });

        socket.on(melody.melody1 + '_set_all_privilege', (data) => {
            if (data.type == 'error') {
                if ($('.' + column).is(':checked')) {
                    checkUncheckAll(column, 'no');
                } else {
                    checkUncheckAll(column, 'yes');
                }
                swal.fire({
                    title: 'Warning',
                    text: data['message'],
                    icon: 'warning'
                });
            } else {
                reArrangeSideBar(user);
            }
        });
    }

    function checkUncheckAll(column, condition) {
        $('.group_' + column).prop('checked', condition == 'yes');
    }

    //================================================================================//
    // DROPDOWNS

    userDropdown();
    function userDropdown() {
        socket.off('dropdown');
        socket.off(melody.melody1 + '_user');

        socket.emit('dropdown', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: 'user'
        });

        socket.on(melody.melody1 + '_user', (data) => {
            if (data.type == 'error') {
                console.log(data.message);
            } else {
                $('.afrobuild_privilege_user').html('<option value="" selected>Select User</option>');
                data.forEach(item => {
                    function capitalize(word) {
                        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                    }

                    let firstName = item.first_name ? capitalize(item.first_name.trim()) : '';
                    let lastName = item.last_name ? capitalize(item.last_name.trim()) : '';

                    let fullname = firstName + (lastName ? ' ' + lastName : '');

                    $('.afrobuild_privilege_user').append(`<option value="${item.userid}"> ${fullname.toUcwords()} </option>`);
                });
                makeAllSelectLiveSearch('afrobuild_privilege_user', 'Select User');
            }
        });
    }

    $(document).on('change', 'select.afrobuild_assign_privilege_user, select.afrobuild_assign_privilege_group', function () {
        let dataId = $(this).val();
        if (dataId == "") {
            $('input.checkBox, input.checkBoxAll').prop('checked', false);
        } else {
            socket.emit('specific', {
                melody1: melody.melody1,
                melody2: melody.melody2,
                param: "specific_privilege",
                dataId: dataId
            });
        }

        socket.on(melody.melody1 + '_specific_privilege', (data) => {
            if (data.type == "error") {
                $('input.checkBox').prop('checked', false);
                console.log(data['message']);
            } else {
                if (data.length < 1 || data == undefined) {
                    $('input.checkBox').prop('checked', false);
                } else {
                    setCheckboxProp(data);
                }
            }
        });
    });

    function setCheckboxProp(data) {
        for (let privilegeName in data) {
            $('input.' + privilegeName).prop('checked', data[privilegeName] == "yes");
        }
    }

    //================================================================================//
    // OTHER FUNCTIONS AND EVENTS

    function reArrangeSideBar(user) {
        if (user !== "" || user !== undefined) {
            socket.off('specific');
            socket.emit('specific', {
                melody1: melody.melody1,
                melody2: melody.melody2,
                param: 'get_user_privileges',
                user: user
            });
        }
    }

})();
