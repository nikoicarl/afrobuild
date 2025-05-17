(() => {
    // Navigation control buttons event
    // ====================================================================================================================== //

    // Navigations for main sidebar navs
    $(document).on('click.pagenavigation', 'a.afrobuild_main_navigation_btn', function (e) {
        e.preventDefault();

        const $this = $(this);
        const href = $this.attr('href');
        const appname = $this.data('appname');
        const pageScripts = $this.data('scripts');
        const navparent = $this.data('navparent');
        const pageFileName = href.split('/')[1];

        // Remove all active highlights
        $('.nav-menu .nav-item').removeClass('active');

        // Add active class to current clicked item's parent
        $this.closest('.nav-item').addClass('active');

        // Delay and then navigate
        setTimeout(() => {
            mainPagination(pageFileName, pageScripts, navparent);
        }, 100);
    });


    // ====================================================================================================================== //

    // By default when page loads, we're opening a page based on the URL's pagination. If there isn't any, the dashboard loads.
    // ====================================================================================================================== //

    // Getting current pagination data from browser's local storage
    let pagination = JSON.parse(window.localStorage.getItem('pagination'));

    // Checking if such data exists
    if (pagination) {
        // Pagination data exists, so we're opening the page
        openPage(pagination.pageFileName, pagination.appname);

        // Add active class to corresponding nav item
        $(`a.afrobuild_main_navigation_btn[href="/${pagination.pageFileName}"]`).closest('.nav-item').addClass('active');
    } else {
        // Open dashboard if there is no data in current pagination
        openPage('dashboard', 'afrobuild');

        // Default to dashboard
        $(`a.afrobuild_main_navigation_btn[href="/dashboard"]`).closest('.nav-item').addClass('active');
    }


    // ====================================================================================================================== //
})();
