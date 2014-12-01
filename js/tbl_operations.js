/**
 * Unbind all event handlers before tearing down a page
 */
AJAX.registerTeardown('tbl_operations.js', function () {
    $("#copyTable.ajax").die('submit');
    $("#moveTableForm").die('submit');
    $("#tableOptionsForm").die('submit');
    $("#tbl_maintenance li a.maintain_action.ajax").die('click');
});

/**
 * jQuery coding for 'Table operations'.  Used on tbl_operations.php
 * Attach Ajax Event handlers for Table operations
 */
AJAX.registerOnload('tbl_operations.js', function () {
    /**
     *Ajax action for submitting the "Copy table"
     **/
    $("#copyTable.ajax").live('submit', function (event) {
        event.preventDefault();
        var $form = $(this);
        PMA_prepareForAjaxRequest($form);
        $.post($form.attr('action'), $form.serialize() + "&submit_copy=Go", function (data) {
            if (typeof data !== 'undefined' && data.success === true) {
                if ($form.find("input[name='switch_to_new']").prop('checked')) {
                    PMA_commonParams.set('db', data.db);
                    PMA_commonParams.set(
                        'table',
                        $form.find("input[name='new_name']").val()
                    );
                    PMA_commonActions.refreshMain(false, function () {
                        PMA_ajaxShowMessage(data.message);
                    });
                } else {
                    PMA_ajaxShowMessage(data.message);
                }
                // Refresh navigation when the table is copied
                PMA_reloadNavigation();
            } else {
                PMA_ajaxShowMessage(data.error, false);
            }
        }); // end $.post()
    });//end of copyTable ajax submit

    /**
     *Ajax action for submitting the "Move table"
     */
    $("#moveTableForm").live('submit', function (event) {
        event.preventDefault();
        var $form = $(this);
        var db = $form.find('select[name=target_db]').val();
        var tbl = $form.find('input[name=new_name]').val();
        PMA_prepareForAjaxRequest($form);
        $.post($form.attr('action'), $form.serialize() + "&submit_move=1", function (data) {
            if (typeof data !== 'undefined' && data.success === true) {
                PMA_commonParams.set('db', db);
                PMA_commonParams.set('table', tbl);
                PMA_commonActions.refreshMain(false, function () {
                    PMA_ajaxShowMessage(data.message);
                });
                // Refresh navigation when the table is copied
                PMA_reloadNavigation();
            } else {
                PMA_ajaxShowMessage(data.error, false);
            }
        }); // end $.post()
    });

    /**
     * Ajax action for submitting the "Table options"
     */
    $("#tableOptionsForm").live('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var $form = $(this);
        var $tblNameField = $form.find('input[name=new_name]');
        if ($tblNameField.val() !== $tblNameField[0].defaultValue) {
            // reload page and navigation if the table has been renamed
            PMA_prepareForAjaxRequest($form);
            var tbl = $tblNameField.val();
            $.post($form.attr('action'), $form.serialize(), function (data) {
                if (typeof data !== 'undefined' && data.success === true) {
                    PMA_commonParams.set('table', tbl);
                    PMA_commonActions.refreshMain(false, function () {
                        $('#page_content').html(data.message);
                        PMA_highlightSQL($('#page_content'));
                    });
                } else {
                    PMA_ajaxShowMessage(data.error, false);
                }
            }); // end $.post()
        } else {
            $form.removeClass('ajax').submit().addClass('ajax');
        }
    });

    /**
     *Ajax events for actions in the "Table maintenance"
    **/
    $("#tbl_maintenance li a.maintain_action.ajax").live('click', function (event) {
        event.preventDefault();
        if ($(".sqlqueryresults").length !== 0) {
            $(".sqlqueryresults").remove();
        }
        if ($(".result_query").length !== 0) {
            $(".result_query").remove();
        }
        //variables which stores the common attributes
        $.post($(this).attr('href'), { ajax_request: 1 }, function (data) {
            function scrollToTop() {
                $('html, body').animate({ scrollTop: 0 });
            }
            var $temp_div;
            if (typeof data !== 'undefined' && data.success === true && data.sql_query !== undefined) {
                PMA_ajaxShowMessage(data.message);
                $("<div class='sqlqueryresults ajax'></div>").prependTo("#page_content");
                $(".sqlqueryresults").html(data.sql_query);
                PMA_highlightSQL($('#page_content'));
                scrollToTop();
            } else if (typeof data !== 'undefined' && data.success === true) {
                var $temp_div = $("<div id='temp_div'></div>");
                $temp_div.html(data.message);
                var $success = $temp_div.find(".result_query .success");
                PMA_ajaxShowMessage($success);
                $("<div class='sqlqueryresults ajax'></div>").prependTo("#page_content");
                $(".sqlqueryresults").html(data.message);
                PMA_highlightSQL($('#page_content'));
                PMA_init_slider();
                $(".sqlqueryresults").children("fieldset,br").remove();
                scrollToTop();
            } else {
                $temp_div = $("<div id='temp_div'></div>");
                $temp_div.html(data.error);
                var $error = $temp_div.find("code").addClass("error");
                PMA_ajaxShowMessage($error, false);
            }
        }); // end $.post()
    });//end of table maintenance ajax click
}); //end $(document).ready for 'Table operations'
