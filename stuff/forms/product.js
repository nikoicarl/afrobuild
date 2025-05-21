// Renders the product container section with breadcrumb
function renderProductContainer() {
    $('.afrobuild_main_page_breadcrumb_navigation').html(`
        <div class="page-header">
            <div class="page-title">
                <h3 class="afrobuild_btn " id="afrobuild_manage_product_table_btn" role="button" data-open="table">
                    View All Products
                </h3>
            </div>
        </div>
    `);

    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_product_page_form_display"></div>
            </div>
        </div>
    `;
}

// Renders the product creation form
function renderProductForm() {
    return `
        <div class="row">
            <div class="col-12 layout-spacing">
                <div class="stat-card p-4">
                    <h4 class="mb-4">Create New Product</h4>
                    <form id="productForm" enctype="multipart/form-data" novalidate>
                        <input type="hidden" id="afrobuild_manage_product_hiddenid">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <input type="text" class="form-control" id="product_name" placeholder="Product Name" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <input type="number" class="form-control" id="product_price" placeholder="Price (e.g. 99.99)" step="0.01" required>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 mb-3">
                                <textarea class="form-control" id="product_description" placeholder="Product Description" rows="4" required></textarea>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-12">
                                <div class="row mb-4">
                                    <div class="col-md-12 mt-3">
                                        <label for=""> Upload Images</label>
                                        <div class="w-100 afrobuild_manage_product_drop_zone" id="afrobuild_manage_product_drop_zone"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        

                        <div class="row">
                            <div class="col-12 text-end">
                                <button type="submit" class="btn afrobuild_btn afrobuild_manage_product_submit_btn">Submit Product</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Immediately Invoked Function Expression (IIFE) to render the full product page
(() => {
    // Render breadcrumb and container layout
    const productContainerHTML = renderProductContainer();
    $('#afrobuild_main_content_display').html(productContainerHTML);

    // Inject the form into the dedicated div inside the container
    const formHtml = renderProductForm();
    $('#afrobuild_product_page_form_display').html(formHtml);

    // Load page-specific logic/
    addExternalScript('assets/js/DropZone.js');
    addPageScript('app/productAjax');
})();
