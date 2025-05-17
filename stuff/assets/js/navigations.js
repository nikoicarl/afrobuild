(()=>{
    //Navigation control buttons event
    //======================================================================================================================//
        //Navigations for main sidebar navs
        $(document).on('click.pagenavigation', 'a.afrobuild_main_navigation_btn', function(e) {
            e.preventDefault();
            let thisElement = (this);
            let pageFileName = $(this).attr('href');
            let appname = $(this).data('appname');
            let pageScripts = $(this).data("scripts");
            let navparent = $(this).data("navparent");
            pageFileName = pageFileName.split("/")[1];

            $('.flatpickr-calendar').remove();
            setTimeout(() => {
                mainPagination(pageFileName, appname, pageScripts, navparent);
            }, 100);
        });

    //======================================================================================================================//


    //By default when page loads, we're openning a page based on the url's pagination. If there isn't any the dashboard loads
    //======================================================================================================================//
        //Getting current pagination data from browser's local storage
        let pagination = JSON.parse(window.localStorage.getItem('pagination'));
        
        //Checking if such data exist
        if (pagination) {
            //Pagination data exist, so we're opening the page
            openPage(pagination.pageFileName, pagination.appname);

            $('ul.menu-categories li.menu a.dropdown-toggle').removeAttr('data-active');
            $('li.afrobuild_sidebar_nav_parent_'+pagination.navparent+' a.dropdown-toggle').attr('data-active', 'true');

            
                pageScripts = '';
            
        } else {
            //Open dashboard if there is no data in current pagination
            openPage('dashboard', 'afrobuild');

            //Clearing the values to free memory
            pagination = '';
        }
    //======================================================================================================================//
})();