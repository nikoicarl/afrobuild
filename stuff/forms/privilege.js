
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
                <h4 class=" mb-3">Assign User Privilege</h4>
                    <div class="row">
                        <div class="col-md-4">
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
                <label class="form-check-label d-block mb-1 ">${item.replace(/_/g, ' ').toUpperCase()}</label>
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
            <div class="pt-2" id="all_${main.tableName}">
                <div class="row g-2">
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
