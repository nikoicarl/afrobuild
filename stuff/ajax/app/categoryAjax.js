$(document).ready(function () {
    const socket = io();
    const $formDisplay = $('#afrobuild_category_page_form_display');
    const $toggleBtn = $('#afrobuild_manage_category_table_btn');
    const $categoryForm = $('#categoryForm');

    // Toggle between category form and category table
    $(document).on('click.pageopener', '#afrobuild_manage_category_table_btn', function (e) {
        e.preventDefault();
        const isTableView = $(this).data('open') === 'table';

        const html = isTableView ? ejs.render(CategoryTable(), {}) : ejs.render(renderCategoryForm(), {});
        $formDisplay.html(html);

        const btnText = isTableView
            ? `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M19 12H5"></path><path d="M12 5l-7 7 7 7"></path></svg> Go Back`
            : 'View All Categorys';

        $toggleBtn.html(btnText).data('open', isTableView ? 'form' : 'table');

        if (isTableView) categoryTableFetch();
    });

    // Handle form submission for creating or updating category
    $(document).on('click', '.afrobuild_manage_category_submit_btn', function (e) {
        e.preventDefault();

        const categoryData = {
            name: $('#category_name').val().trim(),
            description: $('#category_description').val().trim(), // Added this
            category_hiddenid: $('#category_hiddenid').val().trim(),
            melody1: melody.melody1,
            melody2: melody.melody2
        };

        const $submitBtn = $('.afrobuild_manage_category_submit_btn')
            .html('<div class="spinner-border loader-sm" category="status"></div>')
            .attr('disabled', true);

        setTimeout(() => {
            const action = categoryData.category_hiddenid ? 'update_category' : 'create_category';

            socket.emit('create_category', categoryData);

            socket.once(`${categoryData.melody1}_create_category`, (res) => {
                Swal.fire({
                    title: res.success ? 'Success' : 'Error',
                    text: res.message || (res.success ? `Category ${action === 'create_category' ? 'created' : 'updated'} successfully!` : `Failed to ${action === 'create_category' ? 'create' : 'update'} category.`),
                    icon: res.success ? 'success' : 'error',
                    showConfirmButton: !res.success,
                    timer: res.success ? 2000 : undefined
                });
                $submitBtn.html('Submit').removeAttr('disabled');

                if (res.success) {
                    resetCategoryForm();
                    categoryTableFetch();
                }
            });

            socket.on('error', (err) => {
                $submitBtn.html('Submit').removeAttr('disabled');
                Swal.fire('Error', 'An unexpected error occurred. Please try again later.', 'error');
            });
        }, 300);
    });

    function resetCategoryForm() {
        $categoryForm[0].reset();
        $('#category_hiddenid').val('');
        $('#category_name').val('');
        $('#category_description').val('');
        $('.afrobuild_manage_category_submit_btn').html('Submit').removeAttr('disabled');
    }

    const categoryTableFetch = () => {
        socket.off('table').off(`${melody.melody1}_category_table`);

        socket.emit('table', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: 'category_table'
        });

        socket.on(`${melody.melody1}_category_table`, (data) => {
            if (data.type === 'error') {
                console.error(data.message);
                return;
            }
            categoryDataTable(data);
        });
    };

    function categoryDataTable(dataJSONArray) {
        reCreateMdataTable('afrobuild_category_data_table', 'afrobuild_category_data_table_div');

        $('.afrobuild_category_data_table').mDatatable({
            data: {
                type: 'local',
                source: dataJSONArray,
                pageSize: 10
            },
            search: { input: $('#afrobuild_category_general_search') },
            columns: [
                {
                    field: 'name',
                    title: 'Category Name',
                    template: row => row.name.toUcwords()
                },
                {
                    field: 'description',
                    title: 'Description',
                    template: row => row.description || 'No description provided'
                },
                {
                    field: 'status',
                    title: 'Status',
                    template: row => row.status === 'active'
                        ? `<span class="badge text-bg-success">Active</span>`
                        : `<span class="badge text-bg-danger">${row.status.toUcwords()}</span>`
                },
                {
                    field: 'action',
                    title: 'Action',
                    template: row => {
                        const statusBtn = row.status === "deactivated"
                            ? `<a href="#" class="dropdown-item afrobuild_category_table_edit_btn" data-getid="${row.categoryid}" data-getname="deactivate_category" data-getdata="${row.name.toUcwords()}" data-activate="activate"><i class="icon-checkmark3"></i> Reactivate</a>`
                            : `<a href="#" class="dropdown-item afrobuild_category_table_edit_btn" data-getid="${row.categoryid}" data-getname="deactivate_category" data-getdata="${row.name.toUcwords()}" data-activate="deactivate"><i class="icon-blocked"></i> Deactivate</a>`;

                        const deleteBtn = $('.hidden_delete_for_admin').val() === 'admin'
                            ? `<a href="#" class="dropdown-item afrobuild_category_table_edit_btn" data-getid="${row.categoryid}" data-getname="delete_category" data-getdata="${row.name.toUcwords()}"><i class="icon-close2"></i> Delete</a>`
                            : '';

                        return `
                            <div class="dropdown">
                                <a href="#" class="m-btn--icon-only" data-toggle="dropdown">
                                    <i class="icon-menu7" style="font-size:20px;color:grey;"></i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="afrobuild_category_table_edit_btn dropdown-item" href="#" data-getid="${row.categoryid}" data-getname="specific_category"><i class="icon-pencil"></i>Edit Details</a>
                                    ${statusBtn}
                                    ${deleteBtn}
                                </div>
                            </div>`;
                    }
                }
            ],
        });
    }

    // Edit category
    $(document).on('click', '.afrobuild_category_table_edit_btn', function (e) {
        const action = $(this).data('getname');
        const categoryId = $(this).data('getid');
        const categoryName = $(this).data('getdata');
        const isActivate = $(this).data('activate');

        if (action === 'specific_category') {
            socket.emit('specific', {
                melody1: melody.melody1,
                melody2: melody.melody2,
                melody3: melody.melody3,
                param: action,
                dataId: categoryId
            });

            socket.on(`${melody.melody1}_specific_category`, (res) => {
                if (res.categoryResult) {
                    const html = ejs.render(renderCategoryForm(), {});
                    document.getElementById('afrobuild_category_page_form_display').innerHTML = html;
                    $('#afrobuild_manage_category_table_btn').html('View All Categorys');
                    $('#afrobuild_manage_category_table_btn').data('open', 'table');
                    $('.afrobuild_manage_category_submit_btn').html('Update');
                    populateCategoryForm(res.categoryResult);
                } else {
                    Swal.fire('Error', res.message || 'Error fetching category details', 'error');
                }
            });
        }

        if (action === 'deactivate_category' || action === 'activate_category') {
            const isActivating = isActivate === 'activate';
            const actionVerb = isActivating ? 'Reactivate' : 'Deactivate';
            const pastTenseVerb = isActivate === 'activate' ? 'reactivated' : 'deactivated';

            Swal.fire({
                title: `Are you sure you want to ${actionVerb} this category?`,
                text: `This will change the status of the category ${categoryName}.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: actionVerb,
                cancelButtonText: 'Cancel',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    socket.off('deactivate');
                    socket.off(`${melody.melody1}_${action}`);

                    socket.emit('deactivate', {
                        melody1: melody.melody1,
                        melody2: melody.melody2,
                        param: action,
                        dataId: categoryId,
                        checker: isActivate
                    });

                    socket.once(`${melody.melody1}_${action}`, (res) => {
                        Swal.fire({
                            title: res.type ? 'Success' : 'Error',
                            text: res.message || `Category ${pastTenseVerb} successfully!`,
                            icon: res.type ? 'success' : 'error',
                            showConfirmButton: true
                        });
                        categoryTableFetch();
                    });
                }
            });
        }
    });

    function populateCategoryForm(category) {
        $('#category_name').val(category.name);
        $('#category_description').val(category.description);
        $('#category_hiddenid').val(category.categoryid);
    }

});
