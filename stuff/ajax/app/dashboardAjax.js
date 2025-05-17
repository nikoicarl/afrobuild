$(document).ready(function () {

    html = ejs.render(StatsAndTransTable(), {});
    $('#afrobuild_dashboard_page_form_display').html(html);
    

});