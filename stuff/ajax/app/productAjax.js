$(document).ready(function () {
    // Dropzone Icons
    let dropZoneIcons = {
        pdf: '<div class="icon-file-pdf icon-5x text-danger-400 d-block w-100 h-70"></div>',
        doc: '<div class="icon-file-word icon-5x text-danger-400 d-block w-100 h-70"></div>',
        spreadsheet: '<div class="icon-file-excel icon-5x text-danger-400 d-block w-100 h-70"></div>',
        other: '<div class="icon-file-zip icon-5x text-danger-400 d-block w-100 h-70"></div> '
    };

    const $formDisplay = $('#afrobuild_product_page_form_display');
    const $toggleBtn = $('#afrobuild_manage_product_table_btn');
    const $productForm = $('#productForm');

    // Toggle between table and form
    $(document).on('click.pageopener', 'h3#afrobuild_manage_product_table_btn', function (e) {
        e.preventDefault();
        const isTableView = $(this).data("open") === 'table';
        const html = isTableView ? ejs.render(ProductTable(), {}) : ejs.render(renderProductForm(), {});
        $formDisplay.html(html);

        const btnText = isTableView
            ? `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M19 12H5"></path><path d="M12 5l-7 7 7 7"></path></svg> Go Back`
            : 'View All Products';

        $toggleBtn.html(btnText).data('open', isTableView ? 'form' : 'table');
        if (!isTableView) pageDropZone();
        if (!isTableView) categoryDropdown();
        if (isTableView) productTableFetch();
    });

    // Handle product form submission
    $(document).on('click', '.afrobuild_manage_product_submit_btn', function (e) {
        e.preventDefault();

        const productData = {
            name: $('#product_name').val().trim(),
            price: $('#product_price').val().trim(),
            shipping_fee: $('#product_shipping_fee').val().trim(),
            category: $('#product_category').val().trim(),
            description: $('#product_description').val().trim(),
            product_hiddenid: $('#afrobuild_manage_product_hiddenid').val().trim(),
            DocumentsForUpdate: FilterFileNames(FileNamesHolder),
            melody1: melody.melody1,
            melody2: melody.melody2
        };

        const $submitBtn = $('.afrobuild_manage_product_submit_btn')
            .html('<div class="spinner-border loader-sm" role="status"></div>')
            .attr('disabled', true);

        setTimeout(() => {
            const action = productData.product_hiddenid ? 'update_product' : 'create_product';
            const responseEvent = `${productData.melody1}_${action}`;

            // Remove previous listeners for this event
            socket.off(responseEvent);
            socket.off('error');

            // Only handle next response
            socket.once(responseEvent, (res) => {
                Swal.fire({
                    title: res.success ? 'Success' : 'Error',
                    text: res.message || (res.success ? `Product ${action === 'create_product' ? 'created' : 'updated'} successfully!` : `Failed to ${action === 'create_product' ? 'create' : 'update'} product.`),
                    icon: res.success ? 'success' : 'error',
                    showConfirmButton: !res.success,
                    timer: res.success ? 2000 : undefined
                });
                $submitBtn.html('Submit').removeAttr('disabled');
                if (res.success) {
                    resetProductForm();
                    productTableFetch();
                    pageDropZone();
                }
            });

            socket.once('error', (err) => {
                $submitBtn.html('Submit').removeAttr('disabled');
                Swal.fire('Error', 'An unexpected error occurred. Please try again later.', 'error');
            });

            socket.emit(action, productData);
        }, 300);
    });

    function resetProductForm() {
        $('#productForm')[0].reset();
        $('.product_category').val('').change();
        $('#product_hiddenid').val('');
        FileNamesHolder = [];
        $('.afrobuild_manage_product_submit_btn').html('Submit').removeAttr('disabled');
    }

    // Fetch and render the product table
    const productTableFetch = () => {
        socket.off('table');
        socket.off(`${melody.melody1}_product_table`);

        socket.emit('table', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: 'product_table'
        });

        socket.once(`${melody.melody1}_product_table`, (data) => {
            if (data.type === 'error') {
                console.error(data.message);
                return;
            }
            productDataTable(data);
        });
    };

    // Render the product table
    function productDataTable(dataJSONArray) {
        reCreateMdataTable('afrobuild_product_data_table', 'afrobuild_product_data_table_div');
        $('.afrobuild_product_data_table').mDatatable({
            data: {
                type: 'local',
                source: dataJSONArray,
                pageSize: 10
            },
            search: { input: $('#afrobuild_product_general_search') },
            columns: [
                {
                    field: 'name',
                    title: "Product ",
                    template: row => row.name.toUcwords()
                },
                {
                    field: 'price',
                    title: "Price ",
                    template: row =>
                        `${Number(row.price).toLocaleString('en-GH', {
                            style: 'currency',
                            currency: 'GHS'
                        })}`
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
                        let img = row.documents && row.documents ? (row.documents.split(',') ? row.documents.split(',')[0] : row.documents) : '';
                        if (img && img !== '') {
                            img = (`<img src="uploads/${img}" style="max-width: 40px; max-height: 40px; border-radius: 4px; cursor: pointer;" />`);
                        }
                        return img;
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
                            ? `<a href="#" class="dropdown-item afrobuild_product_table_edit_btn" data-getid="${row.productid}" data-getname="deactivate_product" data-getdata="${row.name.toUcwords()}" data-activate="activate"><i class="icon-checkmark3"></i> Reactivate</a>`
                            : `<a href="#" class="dropdown-item afrobuild_product_table_edit_btn" data-getid="${row.productid}" data-getname="deactivate_product" data-getdata="${row.name.toUcwords()}" data-activate="deactivate"><i class="icon-blocked"></i> Deactivate</a>`;

                        const deleteBtn = $('.hidden_delete_for_admin').val() === 'admin'
                            ? `<a href="#" class="dropdown-item afrobuild_product_table_edit_btn" data-getid="${row.productid}" data-getname="delete_product" data-getdata="${row.name.toUcwords()}"><i class="icon-close2"></i> Delete</a>`
                            : '';

                        return `
                            <div class="dropdown">
                                <a href="#" class="m-btn--icon-only" data-toggle="dropdown">
                                    <i class="icon-menu7" style="font-size:20px;color:grey;"></i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="afrobuild_product_table_edit_btn dropdown-item" href="#" data-getid="${row.productid}" data-getname="specific_product"><i class="icon-pencil"></i>Edit Details</a>
                                    ${statusBtn}
                                    ${deleteBtn}
                                </div>
                            </div>`;
                    }
                }
            ],
        });
    }

    // Handle product table actions (edit, deactivate, activate, delete)
    $(document).on('click', '.afrobuild_product_table_edit_btn', function (e) {
        const action = $(this).data('getname');
        const productId = $(this).data('getid');
        const name = $(this).data('getdata');
        const isActivate = $(this).data('activate');

        if (action === 'specific_product') {
            socket.off(`${melody.melody1}_specific_product`);
            socket.emit('specific', {
                "melody1": melody.melody1,
                "melody2": melody.melody2,
                "melody3": melody.melody3,
                "param": action,
                "dataId": productId
            });

            socket.once(`${melody.melody1}_specific_product`, (res) => {
                if (res.productResult) {
                    const html = ejs.render(renderProductForm(), {});
                    document.getElementById('afrobuild_product_page_form_display').innerHTML = html;
                    pageDropZone();
                    categoryDropdown();
                    $('#afrobuild_manage_product_table_btn').html('View All Products');
                    $('#afrobuild_manage_product_table_btn').data('open', "table");
                    $('.product_submit_btn').html('Update');
                    populateProductForm(res.productResult);
                    FileNamesHolder = [];
                    if (res.productResult) {
                        let list = res.productResult.documents.split(',') ? res.productResult.documents.split(',') : [res.productResult.documents];
                        for (let i = 0; i < list.length; i++) {
                            FileNamesHolder.push(list[i] + '*^*^any_div');
                        }
                    }
                } else {
                    Swal.fire('Error', res.message || 'Error fetching product details', 'error');
                }
            });
        }

        // Deactivate or Activate Product Action
        if (action === 'deactivate_product' || action === 'activate_product') {
            const isActivating = isActivate === 'activate';
            const actionVerb = isActivating ? 'Reactivate' : 'Deactivate';
            const pastTenseVerb = isActivate === 'activate' ? 'reactivated' : 'deactivated';

            Swal.fire({
                title: `Are you sure you want to ${actionVerb} this product?`,
                text: `This will change the status of the product ${name}.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: actionVerb,
                cancelButtonText: 'Cancel',
                reverseButtons: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    socket.off('deactivate');
                    socket.off(`${melody.melody1}_${action}`);

                    socket.emit('deactivate', {
                        melody1: melody.melody1,
                        melody2: melody.melody2,
                        param: action,
                        dataId: productId,
                        checker: isActivate
                    });

                    socket.once(`${melody.melody1}_${action}`, (res) => {
                        Swal.fire({
                            title: res.type ? 'Success' : 'Error',
                            text: res.message || `Product ${pastTenseVerb} successfully!`,
                            icon: res.type ? 'success' : 'error',
                            showConfirmButton: true
                        });
                        productTableFetch();
                    });
                }
            });
        }
    });

    // Populate the product form with data
    function populateProductForm(product) {
        $('#afrobuild_manage_product_hiddenid').val(product.productid);
        holdProductCategory = product.categoryid;
        $('#product_category').val(product.categoryid).change();
        $('#product_name').val(product.name);
        $('#product_price').val(product.price);
        $('#product_description').val(product.description);
        $('#product_shipping_fee').val(product.shipping_fee);
    }

    // DropZone initialization
    pageDropZone();
    function pageDropZone() {
        const primary_color = '#009345';
        setTimeout(function () {
            FileNamesHolder = [];
            UploadChecker = 0;
            DropZone('afrobuild_manage_product_drop_zone', primary_color.split("**")[0] + '61', dropZoneIcons, {
                requestType: 'socket',
                socketObject: socket,
                socketEvent: 'ovasyte_general_file_upload'
            }, 'image/*', 2);
            $('.afrobuild_manage_product_drop_zone_title').text('Click to upload images here');
            $('.afrobuild_manage_product_drop_zone_subtitle').text(``);
            $('.afrobuild_manage_product_drop_zone_inner').addClass('mt-4');
        }, 200);
    }

    let holdProductCategory;
    // ProductCategory dropdown
    categoryDropdown();
    function categoryDropdown() {
        socket.off('dropdown');
        socket.off(melody.melody1 + '_category');

        socket.emit('dropdown', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: 'category'
        });

        socket.once(melody.melody1 + '_category', function (data) {
            if (data.type == "error") {
                console.log(data.message);
            } else {
                $('.product_category').html(`<option value="" ${holdProductCategory !== undefined ? '' : 'selected'}> Select Category </option>`);
                data.forEach(function (item, index) {
                    $('.product_category').append(`<option value="${item.categoryid}" ${item.categoryid == holdProductCategory ? 'selected' : ''}> ${item.name.toUcwords()} </option>`);
                });
            }
            makeAllSelectLiveSearch('product_category', 'Select Category');
        });
    }
});
