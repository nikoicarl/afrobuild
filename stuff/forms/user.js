
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
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
                <div class="stat-card">
                    <div class="row">
                        <div class="col-md-6">
                            <input type="text" class="form-control" placeholder="First Name" id="first_name">
                        </div>
                        <div class="col-md-6">
                            <input type="text" class="form-control" placeholder="Last Name" id="last_name">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

(()=>{
    let html = ejs.render(UserForm(), {});
    $('#afrobuild_main_content_display').html(html);

    //Add page ajax file(s)
    addPageScript('app/userAjax');
})();