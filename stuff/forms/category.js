// Renders the category container section with breadcrumb
function renderCategoryContainer() {
    $('.afrobuild_main_page_breadcrumb_navigation').html(`
        <div class="page-header">
            <div class="page-title">
                <h3 class="afrobuild_btn" id="afrobuild_manage_category_table_btn" category="button" data-open="table">
                    View All Categories
                </h3>
            </div>
        </div>
    `);

    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_category_page_form_display"></div>
            </div>
        </div>
    `;
}

// Renders the category registration form (Category Name + Description only)
function renderCategoryForm() {
    return `
        <div class="row">
            <div class="col-12 layout-spacing">
                <div class="stat-card p-4">
                    <h4 class="mb-4">Create New Category</h4>
                    <form id="categoryForm" novalidate>
                        <input type="hidden" id="category_hiddenid">

                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <input type="text" class="form-control" id="category_name" placeholder="Category Name" required>
                            </div>
                        </div>

                        <div class="row mt-2">
                            <div class="col-md-12 mb-3">
                                <textarea class="form-control" id="category_description" placeholder="Category Description" rows="3" required></textarea>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 text-end">
                                <button type="submit" class="btn afrobuild_btn category_submit_btn afrobuild_manage_category_submit_btn">Submit</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Renders the category table section
function CategoryTable() {
    return `
        <!-- BEGIN CATEGORY TABLE -->
        <div class="row">
            <div class="col-md-12 mt-3">
                <div class="stat-card afrobuild_category_data_table_div">
                    <div class="search-wrapper">
                        <input type="text" id="afrobuild_category_general_search" class="search-input" placeholder="Search table...">
                        <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>

                    <table class="afrobuild_category_data_table" style="text-align:left"></table>
                </div>
            </div>
        </div>
        <!-- END CATEGORY TABLE -->
    `;
}

// Immediately Invoked Function Expression (IIFE) to render the full category page
(() => {
    // Render breadcrumb and container layout
    const categoryContainerHTML = renderCategoryContainer();
    $('#afrobuild_main_content_display').html(categoryContainerHTML);

    // Inject the form into the dedicated div inside the container
    const formHtml = renderCategoryForm();
    $('#afrobuild_category_page_form_display').html(formHtml);

    // Load page-specific logic
    if (typeof addPageScript === 'function') {
        addPageScript('app/categoryAjax');
    } else {
        console.warn('addPageScript is not defined');
    }
})();
