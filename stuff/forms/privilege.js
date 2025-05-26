
function renderPrivilegeContainer() {
    $('.afrobuild_main_page_breadcrumb_navigation').html(``);

    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_privilege_page_form_display"></div>
            </div>
        </div>
    `;
}

function PrivilegeForm(data) {
    data ||= {};
    let htmlData = '';
    for (const app in data) {
        if (data.hasOwnProperty(app)) {
            htmlData += displayPrivilege(data[app]);
        }
    }

    return `
        <div class="card shadow-sm border-0 p-4">
            <form class="afrobuild_manage_privilege_form">
                <div class="mb-4">
                    <div class="row">
                        <div class="col-md-4">
                            <label class="form-label">Select User</label>
                            <select class="form-control basic afrobuild_privilege_user afrobuild_assign_privilege_user">
                                <!-- Dynamically loaded -->
                            </select>
                        </div>
                    </div>
                </div>
                ${htmlData}
            </form>
        </div>
    `;
}

function displayPrivilege(main) {
    if (!main?.tableTitle) return '';

    const checkboxes = main.columnList
        .filter(item => item !== main.allCheckBox && item !== main.funcName)
        .map(item => `
            <div class="col-md-3 mb-3">
                <label class="form-check-label d-block mb-1 fw-semibold">${item.replace(/_/g, ' ').toUpperCase()}</label>
                <label class="switch s-dark">
                    <input type="checkbox" id="${item}" class="${item} checkBox group_${main.allCheckBox}"
                        name="${item}" value="yes"
                        data-column="${item}" data-all="no"
                        data-category="${main.funcName}" data-table="${main.tableName}">
                    <span class="slider round"></span>
                </label>
            </div>
        `).join('');

    return `
        <fieldset class="border p-3 mb-4 rounded bg-light">
            <legend class="w-auto px-2 font-weight-bold  text-dark d-flex justify-content-between align-items-center">
                <span>${main.icon} ${main.tableTitle.toUpperCase()+'&nbsp'}</span>
                <div class="d-flex align-items-center">
                    <div class="form-check form-switch me-3">
                        <input class="form-check-input checkBoxAll ${main.allCheckBox}" type="checkbox"
                            id="${main.allCheckBox}" name="${main.allCheckBox}" value="yes"
                            data-column="${main.allCheckBox}" data-table="${main.tableName}">
                        <label class="form-check-label" for="${main.allCheckBox}">All</label>
                    </div>
                    <a href="#" class="text-secondary" data-toggle="collapse" data-target="#all_${main.tableName}" aria-expanded="false">
                        <i class="icon-circle-down2"></i>
                    </a>
                </div>
            </legend>
            <div class="collapse" id="all_${main.tableName}">
                <div class="row mt-3">
                    ${checkboxes}
                </div>
            </div>
        </fieldset>
    `;
}

function appPrivileges() {
    socket.off(melody.melody1 + '_get_app_privileges');
    socket.emit('privilege', {
        melody1: melody.melody1,
        melody2: melody.melody2,
        param: 'get_app_privileges'
    });

    socket.on(melody.melody1 + '_get_app_privileges', (data) => {
        const html = ejs.render(PrivilegeForm(data), {});
        $('#afrobuild_privilege_page_form_display').html(html);

        // Load AJAX handlers
        addPageScript('app/privilegeAjax');
    });
}

(() => {
    const html = ejs.render(renderPrivilegeContainer(), {});
    $('#afrobuild_main_content_display').html(html);

    // Trigger privileges fetch
    appPrivileges();
})();
