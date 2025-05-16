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

            ClearCssLinks();

            $('.afrobuild_progress_bar_div').show();
            $('.afrobuild_progress_bar').attr("style", "width: 65%");
            $('.afrobuild_progress_bar').attr("aria-valuenow", 65);
            $('.flatpickr-calendar').remove();
            setTimeout(() => {
                mainPagination(pageFileName, appname, pageScripts, navparent);
            }, 100);
        });

        //Clear added css links
        function ClearCssLinks() {
            document.getElementById('afrobuild_external_stylesheet').href = '';
            document.getElementById('afrobuild_external_stylesheet1').href = '';
            document.getElementById('afrobuild_external_stylesheet2').href = '';
            document.getElementById('afrobuild_external_stylesheet3').href = '';
            document.getElementById('afrobuild_external_stylesheet4').href = '';
            document.getElementById('afrobuild_external_stylesheet5').href = '';
            document.getElementById('afrobuild_external_stylesheet6').href = '';
            document.getElementById('afrobuild_external_stylesheet7').href = '';
            document.getElementById('afrobuild_external_stylesheet8').href = '';
            document.getElementById('afrobuild_external_stylesheet9').href = '';
        }
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

            //Checking if there are multiple scripts to add to page
            // if (pagination.scripts.split("::")[0] == "multiple" || pagination.scripts.split("::")[0] == "double") {
                //Spliting scripts data by comma into an array
                // let pageScripts = pagination.scripts.split("::")[1].split(",");
                // console.log(pageScripts);
                //Add scripts to page in a loop
                // if (Array.isArray(pagination.scripts)) {
                //     for (let i = 0; i < pagination.scripts.length; i++) {
                //         addPageScript(pagination.scripts[i]);
                //     }
                // } else {
                //     addPageScript(pagination.scripts);
                // }

                //Clearing the value to free memory
                pageScripts = '';
            // } else {
            //     //This runs if there is only one script
            //     if (pagination.scripts.split("::")[1] == "" || pagination.scripts.split("::")[1] == undefined) {} else {
            //         addPageScript(pagination.scripts.split("::")[1]);
            //     }
            // }
        } else {
            //Open dashboard if there is no data in current pagination
            openPage('dashboard', 'administration');

            //Clearing the values to free memory
            pagination = '';
        }
    //======================================================================================================================//
})();