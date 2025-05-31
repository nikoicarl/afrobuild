$(document).ready(function () {

    // Dropzone
    let dropZoneIcons = {
        pdf: '<div class="icon-file-pdf icon-5x text-danger-400 d-block w-100 h-70"></div>',
        doc: '<div class="icon-file-word icon-5x text-danger-400 d-block w-100 h-70"></div>',
        spreadsheet: '<div class="icon-file-excel icon-5x text-danger-400 d-block w-100 h-70"></div>',
        other: '<div class="icon-file-zip icon-5x text-danger-400 d-block w-100 h-70"></div> '
    }
    const socket = io();
    const $formDisplay = $('#afrobuild_service_page_form_display');
    const $toggleBtn = $('#afrobuild_manage_service_table_btn');
    const $serviceForm = $('#serviceForm');

    // Handle the toggle between table and form
    $(document).on('click.pageopener', 'h3#afrobuild_manage_service_table_btn', function (e) {
        e.preventDefault();
        const isTableView = $(this).data("open") === 'table';

        // Render the corresponding content based on the current state
        const html = isTableView ? ejs.render(ServiceTable(), {}) : ejs.render(renderServiceForm(), {});
        $formDisplay.html(html);

        // Update the button text for toggling between views
        const btnText = isTableView
            ? `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M19 12H5"></path><path d="M12 5l-7 7 7 7"></path></svg> Go Back`
            : 'View All Services';

        // Set the button data-toggle state for next interaction
        $toggleBtn.html(btnText).data('open', isTableView ? 'form' : 'table');
        // Initialize DropZone if switching to form view
        if (!isTableView) pageDropZone();
        if (!isTableView) categoryDropdown();

        // Fetch the service table if we are in table view
        if (isTableView) serviceTableFetch();
    });

    // Handle service form submission for creating or updating a service
    $(document).on('click', '.afrobuild_manage_service_submit_btn', function (e) {
        e.preventDefault();  // Prevent the default action of the button

        const serviceData = {
            name: $('#service_name').val().trim(),
            price: $('#service_price').val().trim(),
            category: $('#service_category').val().trim(),
            description: $('#service_description').val().trim(),
            service_hiddenid: $('#afrobuild_manage_service_hiddenid').val().trim(),
            DocumentsForUpdate: FilterFileNames(FileNamesHolder),
            melody1: melody.melody1,
            melody2: melody.melody2
        };

        const $submitBtn = $('.afrobuild_manage_service_submit_btn')
            .html('<div class="spinner-border loader-sm" role="status"></div>')
            .attr('disabled', true);

        setTimeout(() => {
            // Determine if it's create or update action based on service_hiddenid
            const action = serviceData.service_hiddenid ? 'update_service' : 'create_service';

            // Emit the respective socket event
            socket.emit('create_service', serviceData);

            // Handle response based on action
            socket.once(`${serviceData.melody1}_${'create_service'}`, (res) => {
                Swal.fire({
                    title: res.success ? 'Success' : 'Error',
                    text: res.message || (res.success ? `Service ${action === 'create_service' ? 'created' : 'updated'} successfully!` : `Failed to ${action === 'create_service' ? 'create' : 'update'} service.`),
                    icon: res.success ? 'success' : 'error',
                    showConfirmButton: !res.success,
                    timer: res.success ? 2000 : undefined
                });
                $submitBtn.html('Submit').removeAttr('disabled');

                // If successful, reset the form and clean up
                if (res.success) {
                    resetServiceForm();
                    serviceTableFetch();
                    pageDropZone();
                }
            });

            socket.on('error', (err) => {
                $submitBtn.html('Submit').removeAttr('disabled');
                Swal.fire('Error', 'An unexpected error occurred. Please try again later.', 'error');
            });
        }, 300);
    });


    function resetServiceForm() {
        $('#serviceForm')[0].reset();
        $('.service_category').val('').change();  // Reset the form fields
        $('#service_hiddenid').val('');  // Clear the hidden ID field
        FileNamesHolder = [];  // Clear the file names holder
        $('.afrobuild_manage_service_submit_btn').html('Submit').removeAttr('disabled');  // Reset submit button text and enable
    }

    // Function to fetch and render the service table
    const serviceTableFetch = () => {
        socket.off('table').off(`${melody.melody1}_service_table`);

        socket.emit('table', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: 'service_table'
        });

        socket.on(`${melody.melody1}_service_table`, (data) => {
            if (data.type === 'error') {
                console.error(data.message);
                return;
            }
            serviceDataTable(data);
        });
    };

    // Function to handle service table rendering
    function serviceDataTable(dataJSONArray) {
        reCreateMdataTable('afrobuild_service_data_table', 'afrobuild_service_data_table_div');

        $('.afrobuild_service_data_table').mDatatable({
            data: {
                type: 'local',
                source: dataJSONArray,
                pageSize: 10
            },
            search: { input: $('#afrobuild_service_general_search') },
            columns: [
                {
                    field: 'name',
                    title: "Service ",
                    template: row => row.name.toUcwords()
                },
                {
                    field: 'price',
                    title: "Price ",
                    template: row => row.price
                },

                {
                    field: 'description',
                    title: "Description ",
                    template: row => row.description
                },
                {
                    field: 'documents',
                    title: "Image",
                    type: 'text',
                    template: function (row) {
                        let img = row.documents && row.documents ? (row.documents.split(',') ? row.documents.split(',')[0] : row.documents) : ''
                        if (img && img != '') {
                            img = (`
                                    <img src="uploads/${img}" style="max-width: 40px; max-height: 40px; border-radius: 4px; cursor: pointer;" />
                                `)
                        }
                        return img
                    }
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
                            ? `<a href="#" class="dropdown-item afrobuild_service_table_edit_btn" data-getid="${row.serviceid}" data-getname="deactivate_service" data-getdata="${row.name.toUcwords()}" data-activate="activate"><i class="icon-checkmark3"></i> Reactivate</a>`
                            : `<a href="#" class="dropdown-item afrobuild_service_table_edit_btn" data-getid="${row.serviceid}" data-getname="deactivate_service" data-getdata="${row.name.toUcwords()}" data-activate="deactivate"><i class="icon-blocked"></i> Deactivate</a>`;

                        const deleteBtn = $('.hidden_delete_for_admin').val() === 'admin'
                            ? `<a href="#" class="dropdown-item afrobuild_service_table_edit_btn" data-getid="${row.serviceid}" data-getname="delete_service" data-getdata="${row.name.toUcwords()}"><i class="icon-close2"></i> Delete</a>`
                            : '';

                        return `
                            <div class="dropdown">
                                <a href="#" class="m-btn--icon-only" data-toggle="dropdown">
                                    <i class="icon-menu7" style="font-size:20px;color:grey;"></i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="afrobuild_service_table_edit_btn dropdown-item" href="#" data-getid="${row.serviceid}" data-getname="specific_service"><i class="icon-pencil"></i>Edit Details</a>
                                    ${statusBtn}
                                    ${deleteBtn}
                                </div>
                            </div>`;
                    }
                }
            ],
        });
    }

    // Update Service on Click
    $(document).on('click', '.afrobuild_service_table_edit_btn', function (e) {
        const action = $(this).data('getname');
        const serviceId = $(this).data('getid');
        const name = $(this).data('getdata');
        const isActivate = $(this).data('activate'); // Checks if it's an 'activate' action

        // Specific Service Action
        if (action === 'specific_service') {
            socket.emit('specific', {
                "melody1": melody.melody1,
                "melody2": melody.melody2,
                "melody3": melody.melody3,
                "param": action,
                "dataId": serviceId
            });

            socket.on(`${melody.melody1}_specific_service`, (res) => {
                if (res.serviceResult) {
                    const html = ejs.render(renderServiceForm(), {});
                    document.getElementById('afrobuild_service_page_form_display').innerHTML = html;

                    pageDropZone();
                    categoryDropdown();

                    $('#afrobuild_manage_service_table_btn').html('View All Services');
                    $('#afrobuild_manage_service_table_btn').data('open', "table");
                    $('.service_submit_btn').html('Update');
                    populateServiceForm(res.serviceResult);  // Populate the form with service data
                    FileNamesHolder = [];
                    if (res.serviceResult) {
                        let list = res.serviceResult.documents.split(',') ? res.serviceResult.documents.split(',') : [res.serviceResult.documents];
                        for (let i = 0; i < list.length; i++) {
                            FileNamesHolder.push(list[i] + '*^*^any_div')
                        }
                    }
                } else {
                    Swal.fire('Error', res.message || 'Error fetching service details', 'error');
                }
            });
        }

        // Deactivate or Activate Service Action
        if (action === 'deactivate_service' || action === 'activate_service') {
            const isActivating = isActivate === 'activate';
            const actionVerb = isActivating ? 'Reactivate' : 'Deactivate';
            const pastTenseVerb = isActivate === 'activate' ? 'reactivated' : 'deactivated';


            Swal.fire({
                title: `Are you sure you want to ${actionVerb} this service?`,
                text: `This will change the status of the service ${name}.`,
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
                        dataId: serviceId,
                        checker: isActivate
                    });

                    socket.once(`${melody.melody1}_${action}`, (res) => {
                        Swal.fire({
                            title: res.type ? 'Success' : 'Error',
                            text: res.message || `Service ${pastTenseVerb} successfully!`,
                            icon: res.type ? 'success' : 'error',
                            showConfirmButton: true
                        });
                        serviceTableFetch();  // Refresh table after action
                    });
                }
            });

        }
    });


    // Function to populate the service form with data
    function populateServiceForm(service) {
        $('#afrobuild_manage_service_hiddenid').val(service.serviceid);
        holdServiceCategory = service.categoryid;
        $('#service_category').val(service.categoryid).change();
        $('#service_name').val(service.name);
        $('#service_price').val(service.price);
        $('#service_description').val(service.description);
        // If you need more fields, populate them here
    }

    pageDropZone();
    function pageDropZone() {
        const primary_color = '#009345';
        setTimeout(function () {
            FileNamesHolder = []
            UploadChecker = 0
            DropZone('afrobuild_manage_service_drop_zone', primary_color.split("**")[0] + '61', dropZoneIcons, {
                requestType: 'socket',
                socketObject: socket,
                socketEvent: 'ovasyte_general_file_upload'
            }, 'image/*', 2)
            $('.afrobuild_manage_service_drop_zone_title').text('Click to upload images here');
            $('.afrobuild_manage_service_drop_zone_subtitle').text(``);
            // $('.afrobuild_manage_service_drop_zone_label').css('height', '150px');
            $('.afrobuild_manage_service_drop_zone_inner').addClass('mt-4');
        }, 200)
    }



    let holdServiceCategory;
    //ServiceCategory dropdown
    categoryDropdown();
    function categoryDropdown() {
        socket.off('dropdown');
        socket.off(melody.melody1 + '_category');

        socket.emit('dropdown', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: 'category'
        });

        //Get dropdown data
        socket.on(melody.melody1 + '_category', function (data) {
            //Get json content from login code
            if (data.type == "error") {
                console.log(data.message);
            } else {
                $('.service_category').html(`<option value="" ${holdServiceCategory !== undefined ? '' : 'selected'}> Select Category </option>`);
                data.forEach(function (item, index) {
                    $('.service_category').append(`<option value="${item.categoryid}" ${item.categoryid == holdServiceCategory ? 'selected' : ''}> ${item.name.toUcwords()} </option>`);
                });
            }
            makeAllSelectLiveSearch('service_category', 'Select Category')
        });
    }
});

