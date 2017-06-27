(function($){
	$.fn.Combobox = function (options) {
	    'use strict';
		
		/* SETTINGS -----------------------------------------------------------------------------*/
	    var element = $(this),
	    	selectOptions = [],
	    	ignoreKeyup = false,
	    	documentClickAdded = false,
	        settings = $.extend({}, {
	            pluginCssClass : "combobox",
	            comboboxToggleCssClass : "combobox-toggle",
	    		focusedItemCssClass : "focus",
	        }, options),

	    /* EVENT HANDLERS -----------------------------------------------------------------------*/
	    toggleLinkClickEventHandler = function (element, options) {
            $(element).parent().find("ul").empty();

            $.each(options, function(key, value) {
            	var valueHtml = "";

            	if (value.type === "option") {
            		valueHtml = " data-value='" + value.value + "'";
            	}

                $(element).parent().find("ul").append("<li class='" + value.type + "'" + valueHtml + ">" + value.text + "</li>");
            });

            toggleVisibility($(element).parent().find("ul"));

            $(element).parent().find("input").focus();

            return false;
	    },

	    setDocumentClickEventHandler = function () {
	    	$(document).on("click", function (e) {
			    $("." + settings.pluginCssClass + " ul").hide();
			});
	    },

	    inputKeyUpEventHandler = function (element, options) {
            if (ignoreKeyup === false) {
                var query = $("input", element).val();

                var results = $.grep(options, function(item){
                	if (item.type === "option") {
                		return item.text.search(RegExp("^" + query, "i")) != -1;
                	}
                    
                });

                $("ul", element).empty();

                if (query !== "") {
                	$.each(results, function(key, value) {
                		var valueHtml = "";

		            	if (value.type === "option") {
		            		valueHtml = " data-value='" + value.value + "'";
		            	}

	                    $("ul", element).append("<li class='" + value.type + "'" + valueHtml + ">" + value.text + "</li>");
	                });
                } else {
                	$.each(options, function(key, value) {
                		var valueHtml = "";

		            	if (value.type === "option") {
		            		valueHtml = " data-value='" + value.value + "'";
		            	}

	                    $("ul", element).append("<li class='" + value.type + "'" + valueHtml + ">" + value.text + "</li>");
	                });
                }

                if (results.length !== 0) {					
                	$("ul", element).show();
                } else {
					$("ul", element).hide();
				}

                $("ul li.option", element).on("click", function () {
                    $("input", element).val($(this).text());
                    $("ul", element).hide();
                });
            }
		},

		setInputKeydownEventHandler = function (e, element) {
			ignoreKeyup = false;

			// Invoke function by keycode
            invokeFunctionOnArrowDownPress(e, element);
            invokeFunctionOnArrowUpPress(e, element);
            invokeFunctionOnEnterPress(e, element);
            invokeFunctionOnTabPress(e, element);         
		},

		invokeFunctionOnArrowDownPress = function (event, element) {
			if (event.keyCode === 40) {
                ignoreKeyup = true;

                if ($("ul li.option", element).hasClass(settings.focusedItemCssClass)) {
                    var focused = $("ul li.option" + "." + settings.focusedItemCssClass, element);
                    focused.removeClass(settings.focusedItemCssClass);

                    if (focused.next().hasClass("option")) {
                    	focused.next().addClass(settings.focusedItemCssClass);
                    } else if ("optgroup") {
                    	focused.next().next().addClass(settings.focusedItemCssClass);
                    }
                } else {
                    $("ul li.option", element).first().addClass(settings.focusedItemCssClass);
                }
            }
		},

		invokeFunctionOnArrowUpPress = function (event, element) {
			if (event.keyCode === 38) {
                ignoreKeyup = true;

                if ($("ul li.option", element).hasClass(settings.focusedItemCssClass)) {
                    var focused = $("ul li.option" + "." + settings.focusedItemCssClass, element);
                    focused.removeClass(settings.focusedItemCssClass);

                    if (focused.prev().hasClass("option")) {
                    	focused.prev().addClass(settings.focusedItemCssClass);
                    } else if ("optgroup") {
                    	focused.prev().prev().addClass(settings.focusedItemCssClass);
                    }
                } else {
                    $("ul li.option", element).last().addClass(settings.focusedItemCssClass);
                }
            }
		},

		invokeFunctionOnEnterPress = function (event, element) {
			if (event.keyCode === 13) {
                ignoreKeyup = true;
                var focused = $("ul li" + "." + settings.focusedItemCssClass, element);
                $("input", element).val(focused.text());
                var selectValue = $(focused).attr("data-value");
				$("select", element).val(selectValue);
                $("input", element).trigger("change");
                $("ul", element).hide();
            }
		},

		invokeFunctionOnTabPress = function (event, element) {
			if (event.keyCode === 9) {
                ignoreKeyup = true;

                if ($("ul li", element).hasClass(settings.focusedItemCssClass)) {
                    var focused = $("ul li" + "." + settings.focusedItemCssClass, element);
                    $("input", element).val(focused.text());
                    var selectValue = $(focused).attr("data-value");
					$("select", element).val(selectValue);
                    $("input", element).trigger("change");
                    $("ul", element).hide();
                } else {
                    $("." + settings.pluginCssClass + " ul").hide();  
                }
            }
		},

	    /* HELPER FUNCTIONS ---------------------------------------------------------------------*/
	    toggleVisibility = function (element) {
	    	if($(element).css("display") === "none") {
                $(element).show();
            } else {
                $(element).hide();
            }
	    },

	    /* LAUNCH THE COMBOBOX ------------------------------------------------------------------*/
	    getSelectOptionsCache = function (element) {
	    	var cache = [];

	    	// If there are no options group, only options can be cached
	    	if ($("select optgroup", element).length === 0) {
	    		// Cache each option
	    		$.each($("select option", element), function(key, value) {
		            cache.push({
		            	type: "option",
		            	text: $(value).text(),
		            	value : $(value).attr("value")
		            });
		        });
	    	} else {
	    		// If there area options groups, cache those and go thgrough all options inside them
	    		$.each($("select optgroup", element), function(key, value) {

	    			// Cache option group
		            cache.push({
		            	type: "optgroup",
		            	text: $(this).attr("label")
		            });

		            // Cache each option inside option group
		            $.each($("option", this), function(key, value) {
			            cache.push({
			            	type: "option",
			            	text: $(value).text(),
		            		value : $(value).attr("value")
			            });
			        });
		        });
	    	}
	    	
	        return cache;
	    },

	    includeComboboxHtml = function (element) {
	    	setupToggleLink(element);
	    	setupResultsOptionList(element);
	    	hideElements();
	    },

	    // Sets the the link to toggle listing select arrow like
	    setupToggleLink = function (element) {
	    	$("input", element).after('<a href="" class="' + settings.comboboxToggleCssClass + '"></a>');

	    	// Set tabindex to bypass link in tab navigation
	    	$("a", element).attr("tabIndex", "-1");
	    },

	    // Set up the option results inside listing
	    setupResultsOptionList = function (element) {
	    	$(element).append("<ul></ul>");

	    	$.each(element.cache, function(key, value) {
	            var li = $("ul", element).append("<li class='" + value.type + "'>" + value.text + "</li>");
	        });
	    },

	    // Hide all elemetns that has to hidden by default
	    hideElements = function () {
	    	$("." + settings.pluginCssClass + " select, ." + settings.pluginCssClass + " ul").hide();
	    };
		
		// For each combobox instance
	    return this.each(function() {
	    	// Generate cache of select options
			this.cache = getSelectOptionsCache(this);

			// Append html
			includeComboboxHtml(this);

			var that = this;
			// Bind toggle link event
			$("a", this).on("click", function () {
				return toggleLinkClickEventHandler(this, that.cache);
			});
			
			// Since the li element change all the time, let's wrap onclick ul element
			$("ul", this).on("click", function(e) {
				// Set the text from click target to input if it an option not group label
				if ($(e.target).hasClass("option")) {
					$(this).parent().find("input").val($(e.target).text());
					var selectValue = $(e.target).attr("data-value");
					$(this).parent().find("select").val(selectValue);
					$(this).parent().find("input").trigger("change");

					// Hide ul element and focus to related input
		            $(this).hide();
		            $(this).parent().find("input").focus();
				} else {
					// Don't continue click event
					return false;
				}
			});

			// Bind the keyuo event
			$("input", this).on("keyup", function () {
				inputKeyUpEventHandler(that, that.cache);
			});

			// Bind the keydown event
			$("input", this).on("keydown", function (e) {
				setInputKeydownEventHandler(e, that);
			});

			// If not yet added document click, add it(so only once)
			if (documentClickAdded == false) {
				setDocumentClickEventHandler();
				documentClickAdded = true;
			}
	    });
	};
})(jQuery);