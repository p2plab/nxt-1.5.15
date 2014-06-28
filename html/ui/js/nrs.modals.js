/**
 * @depends {nrs.js}
 */
var NRS = (function(NRS, $, undefined) {
	NRS.fetchingModalData = false;

	// save the original function object
	var _superModal = $.fn.modal;

	// add locked as a new option
	$.extend(_superModal.Constructor.DEFAULTS, {
		locked: false
	});

	// capture the original hide
	var _hide = _superModal.Constructor.prototype.hide;

	// add the lock, unlock and override the hide of modal
	$.extend(_superModal.Constructor.prototype, {
		// locks the dialog so that it cannot be hidden
		lock: function() {
			this.options.locked = true;
		}
		// unlocks the dialog so that it can be hidden by 'esc' or clicking on the backdrop (if not static)
		,
		unlock: function() {
			this.options.locked = false;
		}
		// override the original hide so that the original is only called if the modal is unlocked
		,
		hide: function() {
			if (this.options.locked) return;

			_hide.apply(this, arguments);
		}
	});

	//Reset scroll position of tab when shown.
	$('a[data-toggle="tab"]').on("shown.bs.tab", function(e) {
		var target = $(e.target).attr("href");
		$(target).scrollTop(0);
	})

	//hide modal when another one is activated.
	$(".modal").on("show.bs.modal", function(e) {
		$(this).find("input[name=recipient], input[name=account_id]").mask("NXT-****-****-****-*****");

		var $visible_modal = $(".modal.in");

		if ($visible_modal.length) {
			$visible_modal.modal("hide");
		}
	});

	$(".modal").on("shown.bs.modal", function() {
		$(this).find("input[type=text]:first, textarea:first, input[type=password]:first").not("[readonly]").first().focus();
		$(this).find("input[name=converted_account_id]").val("");
		NRS.showedFormWarning = false; //maybe not the best place... we assume forms are only in modals?
	});

	//Reset form to initial state when modal is closed
	$(".modal").on("hidden.bs.modal", function(e) {
		$(this).find("input[name=recipient], input[name=account_id]").trigger("unmask");

		$(this).find(":input:not([type=hidden],button)").each(function(index) {
			var default_value = $(this).data("default");
			var type = $(this).attr("type");

			if (type == "checkbox") {
				if (default_value == "checked") {
					$(this).prop("checked", true);
				} else {
					$(this).prop("checked", false);
				}
			} else {
				if (default_value) {
					$(this).val(default_value);
				} else {
					$(this).val("");
				}
			}
		});

		//Hidden form field
		$(this).find("input[name=converted_account_id]").val("");

		//Hide/Reset any possible error messages
		$(this).find(".callout-danger:not(.never_hide), .error_message, .account_info").html("").hide();

		$(this).find(".advanced").hide();

		$(this).find(".advanced_extend").each(function(index, obj) {
			var normalSize = $(obj).data("normal");
			var advancedSize = $(obj).data("advanced");
			$(obj).removeClass("col-xs-" + advancedSize + " col-sm-" + advancedSize + " col-md-" + advancedSize).addClass("col-xs-" + normalSize + " col-sm-" + normalSize + " col-md-" + normalSize);
		});

		var $feeInput = $(this).find("input[name=feeNXT]");

		if ($feeInput.length) {
			var defaultFee = $feeInput.data("default");
			if (!defaultFee) {
				defaultFee = 1;
			}

			$(this).find(".advanced_fee").html(NRS.formatAmount(NRS.convertToNQT(defaultFee)) + " NXT");
		}

		NRS.showedFormWarning = false;
	});

	NRS.showModalError = function(errorMessage, $modal) {
		var $btn = $modal.find("button.btn-primary:not([data-dismiss=modal], .ignore)");

		$modal.find("button").prop("disabled", false);

		$modal.find(".error_message").html(String(errorMessage).escapeHTML()).show();
		$btn.button("reset");
		$modal.modal("unlock");
	}

	NRS.closeModal = function($modal) {
		if (!$modal) {
			$modal = $("div.modal.in:first");
		}

		$modal.find("button").prop("disabled", false);

		var $btn = $modal.find("button.btn-primary:not([data-dismiss=modal], .ignore)");

		$btn.button("reset");
		$modal.modal("unlock");
		$modal.modal("hide");
	}

	$("input[name=feeNXT]").on("change", function() {
		var $modal = $(this).closest(".modal");

		var $feeInfo = $modal.find(".advanced_fee");

		if ($feeInfo.length) {
			$feeInfo.html(NRS.formatAmount(NRS.convertToNQT($(this).val())) + " NXT");
		}
	});

	$(".advanced_info a").on("click", function(e) {
		e.preventDefault();

		var $modal = $(this).closest(".modal");

		$modal.find(".advanced").fadeIn();

		$modal.find(".advanced_extend").each(function(index, obj) {
			var normalSize = $(obj).data("normal");
			var advancedSize = $(obj).data("advanced");
			$(obj).addClass("col-xs-" + advancedSize + " col-sm-" + advancedSize + " col-md-" + advancedSize).removeClass("col-xs-" + normalSize + " col-sm-" + normalSize + " col-md-" + normalSize);
		});
	});

	return NRS;
}(NRS || {}, jQuery));