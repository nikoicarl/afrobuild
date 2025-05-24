// Renders the merchant container section with breadcrumb
function renderMerchantContainer() {
    $('.afrobuild_main_page_breadcrumb_navigation').html(`
        <div class="page-header">
            <div class="page-title">
                <h3 id="afrobuild_manage_merchant_table_btn" class="afrobuild_btn" role="button" data-open="table">
                    View All Merchants
                </h3>
            </div>
        </div>
    `);

    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_merchant_page_form_display"></div>
            </div>
        </div>
    `;
}

// Renders the merchant registration form
function renderMerchantForm() {
    return `
        <div class="row">
            <div class="col-12 layout-spacing">
                <div class="stat-card p-4">
                    <h4 class="mb-4">Create New Merchant</h4>
                    <form id="merchantForm" novalidate>
                        <input type="hidden" id="merchant_hiddenid">

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <input type="text" class="form-control" id="name" placeholder="Merchant Name" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <input type="email" class="form-control" id="email" placeholder="example@mail.com" required>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <input type="text" class="form-control" id="phone" placeholder="Phone Number" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <input type="text" class="form-control" id="location" placeholder="Location">
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <textarea id="address" class="form-control" rows="3" placeholder="Address"></textarea>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 text-end">
                                <button type="submit" class="btn afrobuild_btn afrobuild_manage_merchant_submit_btn merchant_submit_btn" role="button">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Renders the merchant table section
function MerchantTable() {
    return `
        <!-- BEGIN MERCHANT TABLE -->
        <div class="row">
            <div class="col-md-12 mt-3">
                <div class="stat-card afrobuild_merchant_data_table_div">
                    <div class="search-wrapper">
                        <input type="text" id="afrobuild_merchant_general_search" class="search-input" placeholder="Search table...">
                        <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <table class="afrobuild_merchant_data_table" style="text-align:left"></table>
                </div>
            </div>
        </div>
        <!-- END MERCHANT TABLE -->
    `;
}

// IIFE to render the merchant management UI
(() => {
    // Set breadcrumb + layout container
    const merchantContainerHTML = renderMerchantContainer();
    $('#afrobuild_main_content_display').html(merchantContainerHTML);

    // Load the merchant form
    const formHtml = renderMerchantForm();
    $('#afrobuild_merchant_page_form_display').html(formHtml);

    // Load supporting logic
    if (typeof addPageScript === 'function') {
        addPageScript('app/merchantAjax');
    } else {
        console.warn('addPageScript is not defined');
    }
})();
