// Renders the service container section
function Service() {
    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_service_page_form_display"></div>
            </div>
        </div>
    `;
}

function ServiceForm() {
    return `
        <div class="row">
            <div class="col-12 layout-spacing">
                <div class="stat-card p-4">
                    <h4 class="mb-4">Create New Service</h4>
                    <form id="serviceForm" enctype="multipart/form-data" novalidate>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <input type="text" class="form-control" id="service_name" placeholder="Service Name" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <input type="number" class="form-control" id="service_price" placeholder="Price (e.g. 99.99)" step="0.01" required>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 mb-3">
                                <textarea class="form-control" id="service_description" placeholder="Service Description" rows="4" required></textarea>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 mb-3">
                                <label for="service_documents" class="form-label">Upload Documents</label>
                                <input type="file" class="form-control" id="service_documents" multiple>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 text-end">
                                <button type="submit" class="btn afrobuild_btn service_submit_btn">Submit Service</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}


// Immediately Invoked Function Expression (IIFE) to render the form
(() => {
    const formHtml = ServiceForm(); // No EJS rendering needed unless using EJS tags
    $('#afrobuild_main_content_display').html(formHtml);

    // Load page-specific scripts
    addPageScript('app/serviceAjax');
})();
