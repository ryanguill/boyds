var APP  = APP || {};

APP.controls = (function controls($, config) {
    "use strict";

	function init() {
		$("#showHideSettings").on("click", function() {
			var inputParams = $("#inputParams");
			if (inputParams.hasClass("open")) {
				inputParams.removeClass("open");
				inputParams.stop().animate({height: "10px"}, 750);
			} else {
				inputParams.addClass("open");
				inputParams.stop().animate({height: "400px"}, 750);
			}
		});
	}


	init();

    return {

    };

}(jQuery, APP.config));
