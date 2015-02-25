// 
// Altasoft Navigation Plugin - ajax based navigation for better UX and low traffic load
// 
// V1.1

$(function () {

    var popupWaitingShowDelay = 500; //ms
    var popupLongWaitingShowDelay = 1500; //ms

    var MainContentSelector = '#MainContent';

    var $popup = createWaitingPopup();
    $('body').append($popup);


    var navigate = function (url, skipAnimation, fadeSelector) {

        $(document).trigger('navigating');

        try {
            hideContent();
        }
        catch (err) { }

        try {
            history.pushState(url, document.title, url);
            loadPage(url, skipAnimation, fadeSelector);
        }
        catch (err) {
            alert(err)
            window.location.assign(url);
        }
    }

    function loadPage(url, skipAnimation, fadeSelector) {
        if (!url) return;

        if (!fadeSelector)
            fadeSelector = MainContentSelector;

        if (!skipAnimation)
            $(fadeSelector).fadeTo('fast', 0);

        var ajaxFinished = false;

        $.ajax({
            url: url,
            type: "GET",
            headers: {
                "pageonly": true
            },
            beforeSend: function () {
                setTimeout(function () {
                    if (!ajaxFinished) {
                        showWaitingPopup();
                    }
                }, popupWaitingShowDelay);
            },
            success: function (data) {
                $popup.hide();
                ajaxFinished = true;
                $(MainContentSelector).fadeTo('fast', 0, function () {
                    successDownloadPage(data);

                    hideWaitingPopup();
                });
            },
            error: function (err) {
                $popup.hide();
                ajaxFinished = true;
                console.log('Fallback, error while loading page', err);
                window.location.assign(url);
            }
        });
    }

    function successDownloadPage(data) {
        $(document).scrollTop(0);
        $(MainContentSelector).empty();
        $(MainContentSelector).append(data);
        $(MainContentSelector).fadeTo('fast', 1);
    }


    onpopstate = function (event) {
        loadPage(event.state);
    }

    $(document).on('click', 'a', function () {
        var url = $(this).attr('href');

        if (url && url.indexOf('/') == 0) {
            navigate(url, false);

            return false;
        }
    });

    function createWaitingPopup() {
        var $popupHtml = $('<div id="LoadingPanelModal"></div>');

        $popupHtml.css({
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: "rgba(247, 247, 247, 0.8)",
            zIndex: 10000,
            opacity: 0,
            display: 'none'
            //"pointer-events": "none"
        });

        var loaderImg = $('<img src="/Content/Img/loader.gif" alt="" />').css({
            position: 'absolute',
            left: '50%',
            top: '50%'
        });

        $popupHtml.append(loaderImg);

        return $popupHtml;
    };

    function showWaitingPopup() {
        $popup.fadeTo(200, 1)
    };

    function setPopupText(msg) {
        $popup.children('div').text(msg);
    };

    function hideWaitingPopup() {
        $popup.css({
            opacity: 0,
            display: "none"
        });

    };

    $.altasoft = {
        showWaiting: showWaitingPopup,
        hideWaiting: hideWaitingPopup
    };

    return navigate;
});