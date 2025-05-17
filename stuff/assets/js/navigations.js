(() => {
    // Utility: Set active nav and breadcrumb
    const activateNavAndBreadcrumb = ($navItem) => {
        // Clear previous active states
        $('.nav-menu .nav-item').removeClass('active');

        // Activate current
        $navItem.closest('.nav-item').addClass('active');

        // Set breadcrumb
        const iconHTML = $navItem.find('img').prop('outerHTML');
        const breadcrumbText = $.trim($navItem.text());
        setBreadcrumb(breadcrumbText, iconHTML);
    };

    // Navigation button click handler
    $(document).on('click.pagenavigation', 'a.afrobuild_main_navigation_btn', function (e) {
        e.preventDefault();

        const $this = $(this);
        const href = $this.attr('href');
        const pageFileName = href.split('/')[1];
        const appname = $this.data('appname');
        const pageScripts = $this.data('scripts');
        const navparent = $this.data('navparent');

        activateNavAndBreadcrumb($this);

        setTimeout(() => {
            mainPagination(pageFileName, pageScripts, navparent);
        }, 100);
    });

    // Page load: Restore last visited page or default to dashboard
    const initPageLoad = () => {
        const pagination = JSON.parse(window.localStorage.getItem('pagination'));

        const pageFileName = pagination?.pageFileName || 'dashboard';
        const appname = pagination?.appname || 'afrobuild';

        openPage(pageFileName, appname);

        const $navItem = $(`a.afrobuild_main_navigation_btn[href="/${pageFileName}"]`);
        if ($navItem.length) {
            activateNavAndBreadcrumb($navItem);
        }
    };

    // Initialize
    initPageLoad();
})();
