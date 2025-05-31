// Renders the service container section with breadcrumb
function renderServiceContainer() {
    $('.afrobuild_main_page_breadcrumb_navigation').html(`
        <div class="page-header">
            <div class="page-title">
                <h3 class="afrobuild_btn " id="afrobuild_manage_service_table_btn" role="button" data-open="table">
                    View All Services
                </h3>
            </div>
        </div>
    `);

    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_service_page_form_display"></div>
            </div>
        </div>
    `;
}

// Renders the service creation form
function renderServiceForm() {
    return `
        <div class="row">
            <div class="col-12 layout-spacing">
                <div class="stat-card p-4">
                    <h4 class="mb-4">Create New Service</h4>
                    <form id="serviceForm" enctype="multipart/form-data" novalidate>
                        <input type="hidden" id="afrobuild_manage_service_hiddenid">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <input type="text" class="form-control" id="service_name" placeholder="Service Name" required>
                            </div>
                            <div class="col-md-4 mb-3">
                                <select class="form-control form-control-md basic service_category" id="service_category" required>
                                        <option value="" selected>Select Category</option>
                                    </select>
                            </div>
                            <div class="col-md-4 mb-3">
                                <input type="number" class="form-control" id="service_price" placeholder="Price (e.g. 99.99)" step="0.01" required>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 mb-3">
                                <textarea class="form-control" id="service_description" placeholder="Service Description" rows="4" required></textarea>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-12">
                                <div class="row mb-4">
                                    <div class="col-md-12 mt-3">
                                        <label for=""> Upload Images</label>
                                        <div class="w-100 afrobuild_manage_service_drop_zone" id="afrobuild_manage_service_drop_zone"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        

                        <div class="row">
                            <div class="col-12 text-end">
                                <button type="submit" class="btn afrobuild_btn afrobuild_manage_service_submit_btn">Submit Service</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Renders the service table section
function ServiceTable() {
    return `
        <!-- BEGIN SERVICE TABLE -->
        <div class="row">
            <div class="col-md-12 mt-3">
                <div class="stat-card afrobuild_service_data_table_div">
                    <div class="search-wrapper">
                        <input type="text" id="afrobuild_service_general_search" class="search-input" placeholder="Search table...">
                        <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>

                    <table class="afrobuild_service_data_table" style="text-align:left"></table>
                </div>
            </div>
        </div>
        <!-- END SERVICE TABLE -->
    `;
}

// Immediately Invoked Function Expression (IIFE) to render the full service page
(() => {
    // Render breadcrumb and container layout
    const serviceContainerHTML = renderServiceContainer();
    $('#afrobuild_main_content_display').html(serviceContainerHTML);

    // Inject the form into the dedicated div inside the container
    const formHtml = renderServiceForm();
    $('#afrobuild_service_page_form_display').html(formHtml);

    // Load page-specific logic/
    addExternalScript('assets/js/DropZone.js');
    addPageScript('app/serviceAjax');
})();
