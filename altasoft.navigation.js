// 
// Altasoft Navigation Plugin - ajax based navigation for better UX and low traffic load
// 

(function () {

    var popupWaitingShowDelay = 500; //ms
    var popupLongWaitingShowDelay = 1500; //ms
    var waitingText = "Please wait...";
    var longWaitingText = "It took longer than expexted";

    var MainContentSelector = '#MainContent';

    var $popup = createWaitingPopup();
    $(MainContentSelector).after($popup);

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

			    setTimeout(function () {
			        if (!ajaxFinished)
			            setPopupText(longWaitingText);
			    }, popupLongWaitingShowDelay);
			    
			},
			success: function (data) {
			    ajaxFinished = true;
			    $(MainContentSelector).fadeTo('fast', 0, function () {			        
			        successDownloadPage(data);

			        hideWaitingPopup();
			    });
			},            
			error: function (err) {
			    ajaxFinished = true;
				console.log('Fallback, error while loading page', err);
				window.location.assign(url);
			}
		});
	}

	function successDownloadPage(data) {	    
	    setTimeout(function () {	        
	        $(document).scrollTop(0);	        
	        $(MainContentSelector).empty();
	        $(MainContentSelector).append(data);
	        $(MainContentSelector).fadeTo('fast', 1);
		}, 200);
	}

    
	onpopstate = function (event) {
		loadPage(event.state);
	}

    $(document).on('click', 'a', function () {       
		var url = $(this).attr('href');

		if (url.indexOf('/') == 0) {
			navigate(url, false);

			return false;
		}
    });

    function createWaitingPopup() {
        var $popupHtml = $("<div class='requestWaitingMsg' id='popup-modal'></div>");

        $popupHtml.css({
            position: "fixed",
            "font-family": "Arial, Helvetica, sans-serif",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: "rgba(255,255,255,0.8)",
            "z-index": 10000,
            opacity: 0,
            "pointer-events": "none"
        });

        $popupHtml.append('<div id="msg-content">').find('div#msg-content').
            css({
                width: "400px",
                position: "relative",
                margin: "10% auto"
            }).
            text(waitingText);

        return $popupHtml;
    };

    function showWaitingPopup() {
        $popup.css({
            opacity: 1,
            display: "block"
        });
    };

    function setPopupText(msg) {
        $popup.children('div').text(msg);        
    };

    function hideWaitingPopup() {
        $popup.css({
            opacity: 0,
            display: "none"
        });

        setPopupText(waitingText);        
    };

	return navigate;
})();
