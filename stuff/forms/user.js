function User() {
    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_user_page_form_display"></div>
            </div>
        </div>
    `;
}

function UserForm() {
    return `
        <div class="row">
            <div class="col-12 layout-spacing">
                <div class="stat-card p-4">
                    <h4 class="mb-4">Create New User</h4>
                    <form id="userForm">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <input type="text" class="form-control" placeholder="First Name" id="first_name" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <input type="text" class="form-control" placeholder="Last Name" id="last_name" required>
                            </div>
                        </div>

                        <div class="row mt-2">
                            <div class="col-md-6 mb-3">
                                <input type="email" class="form-control" placeholder="example@mail.com" id="email" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <input type="tel" class="form-control" placeholder="Phone" id="phone">
                            </div>
                        </div>

                        <div class="row mt-2">
                            <div class="col-12 mb-3">
                                <textarea id="address" class="form-control" placeholder="Address" rows="3"></textarea>
                            </div>
                        </div>

                        <div class="row mt-2">
                            <div class="col-md-6 mb-3">
                                <input type="text" class="form-control" placeholder="Username" id="username" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <input type="password" class="form-control" placeholder="Password" id="password" required>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 text-end">
                                <button type="submit" class="btn afrobuild_btn user_submit_btn">Submit</button>
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
    const html = ejs.render(UserForm(), {});
    $('#afrobuild_main_content_display').html(html);

    // Load page-specific scripts
    addPageScript('app/userAjax');
})();
