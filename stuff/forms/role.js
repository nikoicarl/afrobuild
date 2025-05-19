// Role Page Container
function Role() {
return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_role_page_form_display"></div>
            </div>
        </div>
`;
}

// Role Form with only Role Name and Description
function RoleForm() {
return `
        <div class="row">
            <div class="col-12 layout-spacing">
                <div class="stat-card p-4">
                    <h4 class="mb-4">Create New Role</h4>
                    <form id="roleForm">
                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <input type="text" class="form-control" placeholder="Name" id="rolename" name="rolename"
                                    required>
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-12 mb-3">
                                <textarea class="form-control" placeholder="Role Description" id="description"
                                    name="description" rows="3" required></textarea>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 text-end">
                                <button type="submit" class="btn afrobuild_btn role_submit_btn">Submit</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
`;
}

// Immediately Invoked Function to Render Form and Load Scripts
(() => {
const html = ejs.render(RoleForm(), {});
$('#afrobuild_main_content_display').html(html);

// Load page-specific scripts
addPageScript('app/roleAjax');
})();