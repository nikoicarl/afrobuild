// Renders the service container section with breadcrumb
function renderServiceContainer() {
    $('.afrobuild_main_page_breadcrumb_navigation').html(`
        <div class="page-header">
            <div class="page-title">
                <h3 class="afrobuild_btn grey" id="afrobuild_manage_service_table_btn" service="button" data-open="table">
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

// Renders the service form (Service Name + Description only)
function renderServiceForm() {
    return `
        <div class="row">
            <div class="col-12 layout-spacing">
                <div class="stat-card p-4">
                    <h4 class="mb-4">Create New Service</h4>
                    <form id="serviceForm" novalidate>
                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <input type="text" class="form-control" placeholder="Name" id="servicename" name="servicename" required>
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-12 mb-3">
                                <textarea class="form-control" placeholder="Service Description" id="description" name="description" rows="3" required></textarea>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12 text-end">
                                <button type="submit" class="btn afrobuild_btn service_submit_btn">Submit</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
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

    // Load page-specific logic
    addPageScript('app/serviceAjax');
})();
