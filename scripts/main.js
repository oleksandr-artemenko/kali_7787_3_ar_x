window.funnelOptions = {
  lang: "ar",
  // "campaignID": "97",
  brand: 31,
  disableErrorPlaceholder: true,
  // "facebookPixelId": false,
  pathPrefix: "../../",
  // googleAds: "AW-10906613148/d3ozCIiP6cADEJzr1tAo",
  funnel_uri: "/kali_7787_3_ar",
  funnel_atts: ["redirect_brand_on_step_1"],
};

const mainForm = document.querySelector(".form__main");

$(".js-scroll").click(function (e) {
  e.preventDefault();
  if ($(window).width() >= 1200) {
    $("body").addClass("popup-form");
    mainForm.style.opacity = "0";
  } else {
    var id = $(this).attr("href"),
      top = $(id).offset().top;
    $("body,html").animate({ scrollTop: 500 }, 400);
  }
});
$(".popup__form").click(function (e) {
  if (!e.target.closest(".form__wrapper") && !($(window).width() < 1200)) {
    $("body").removeClass("popup-form");
    mainForm.style.opacity = "1";
  }
});
// $(".popup-form__close-icon").click(function (e) {
//   e.preventDefault();
//   $("body").removeClass("popup-form");
// });
$(window).resize(function () {
  if ($(window).width() < 1200) {
    $("body").removeClass("popup-form");
  }
});

if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function (s) {
    var el = this;

    do {
      if (Element.prototype.matches.call(el, s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function (predicate) {
    if (this == null) {
      throw new TypeError(
        "Array.prototype.findIndex called on null or undefined"
      );
    }
    if (typeof predicate !== "function") {
      throw new TypeError("predicate must be a function");
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}

var restrictedCountries = ["223", "104"]; /*"Ukraine", "Israel"*/

(function () {
  /* default Options */
  var globalOptions = {
    stagingApi: false,
  };
  if (typeof window.funnelOptions === "object") {
    $.extend(globalOptions, window.funnelOptions);
  }

  function leadFormFunc(el) {
    this.$form = $(el);

    this.id = this.$form.attr("id");
    this.dcl_hidden = true;
    this.error = false;

    this.required_fields = {};
    this.$form.find(".required-field").each(
      function (i, requiredField) {
        var fieldName = requiredField.getAttribute("name");
        var validationEvent = "blur";
        this.required_fields[fieldName] = requiredField;
        if (
          fieldName === "currency" ||
          fieldName === "terms" ||
          fieldName === "gdpr"
        ) {
          validationEvent = "change";
        }

        $(requiredField)
          .on(
            validationEvent,
            function () {
              if (this.validateField(requiredField)) {
                this.hideErrors(requiredField);
              }
            }.bind(this)
          )
          .keydown(
            function (e) {
              if (!this.allowedKeyDown(e, fieldName, requiredField.value)) {
                e.preventDefault();
              }
            }.bind(this)
          );

        if (localStorage.getItem(fieldName) !== null) {
          if (fieldName === "country") return;

          requiredField.value = localStorage.getItem(fieldName);
        }
      }.bind(this)
    );

    this.$form
      .find(".lead-form__dcl-trigger")
      .on("click", this.toggleDCL.bind(this));

    this.$form.on(
      "submit",
      function (e) {
        this.validateFields();
        e.preventDefault();
      }.bind(this)
    );

    this.$form.find(".lead-form__eye-icon").on("click", function () {
      var passInp = $(this).parent().find("input");
      if (passInp.attr("type") == "password") {
        passInp.attr("type", "text");
        $(this).addClass("lead-form__eye-icon_block");
      } else {
        passInp.attr("type", "password");
        $(this).removeClass("lead-form__eye-icon_block");
      }
    });

    this.$form.on(
      "click",
      function (event) {
        if (event.target.closest(".lead-form__dcl-item")) {
          var targetElem = event.target.closest(".lead-form__dcl-item");
          this.setCountyInfo(targetElem.dataset.id, true);
        }
      }.bind(this)
    );
  }
  leadFormFunc.prototype.toggleDCL = function () {
    if (this.dcl_hidden) {
      this.showDCL();
    } else {
      this.hideDCL();
    }
  };
  leadFormFunc.prototype.showDCL = function () {
    var countryDropdown = this.$form.find(".lead-form__dcl");
    var countryIso = this.$form
      .find(".lead-form__data-item_prefix")
      .attr("data-iso");
    var activeDropItem = countryDropdown.find(
      '[data-iso="' + countryIso + '"]'
    );

    this.dcl_hidden = false;
    countryDropdown.show();
    $("body").addClass("modal-opened");

    if (activeDropItem.length) {
      countryDropdown.scrollTop(activeDropItem.position().top);
    }
    var isOpening = true;
    $("html").on(
      "click." + this.id,
      function () {
        if (!isOpening) {
          this.hideDCL();
        }
        isOpening = false;
      }.bind(this)
    );
  };
  leadFormFunc.prototype.hideDCL = function () {
    $("html").off("." + this.id);
    this.dcl_hidden = true;
    this.$form.find(".lead-form__dcl").hide();
    $("body").removeClass("modal-opened");
  };
  leadFormFunc.prototype.initCountryList = function () {
    var selectedCountryId = localStorage.getItem("country")
      ? +localStorage.getItem("country")
      : window.geoIpData
      ? window.geoIpData.id
      : null;

    this.$form.find(".lead-form__dcl-inner").html(
      Object.keys(window.countryList)
        .map(function (countryKey) {
          let country = window.countryList[countryKey];
          if (country.id === selectedCountryId) {
            this.setCountyInfo(country.id);
          }
          return (
            '<div class="lead-form__dcl-item" data-id="' +
            country.id +
            '" data-iso="' +
            country.iso.toLocaleLowerCase() +
            '"><span class="lead-form__dcl-item-title">' +
            country.name +
            '</span><span class="lead-form__dcl-item-code">+' +
            country.countryCode +
            "</span></div>"
          );
        }, this)
        .join("")
    );
  };
  leadFormFunc.prototype.setCountyInfo = function (countryId, isManual) {
    var countryList = window.countryList;

    this.$form
      .find(".lead-form__data-item_prefix")
      .attr("data-iso", countryList[countryId].iso.toLocaleLowerCase())
      .find('[name="country_prefix"]')
      .val("+" + countryList[countryId].countryCode);

    var countryInput = $(this.required_fields.country);
    countryInput.val(countryId);
    isManual && countryInput.blur();
  };
  leadFormFunc.prototype.allowedKeyDown = function (
    kdEvent,
    fieldName,
    fieldValue
  ) {
    // Allow: backspace, delete, tab, escape, enter
    if (
      $.inArray(kdEvent.keyCode, [46, 8, 9, 27, 13]) !== -1 ||
      // Allow: Ctrl+V
      (kdEvent.keyCode == 86 &&
        (kdEvent.ctrlKey === true || kdEvent.metaKey === true)) ||
      // Allow: Ctrl+A
      (kdEvent.keyCode == 65 &&
        (kdEvent.ctrlKey === true || kdEvent.metaKey === true)) ||
      // Allow: Ctrl+C
      (kdEvent.keyCode == 67 &&
        (kdEvent.ctrlKey === true || kdEvent.metaKey === true)) ||
      // Allow: Ctrl+X
      (kdEvent.keyCode == 88 &&
        (kdEvent.ctrlKey === true || kdEvent.metaKey === true)) ||
      // Allow: home, end, left, right
      (kdEvent.keyCode >= 35 && kdEvent.keyCode <= 39)
    ) {
      // let it happen, don't do anything
      return true;
    }
    switch (fieldName) {
      case "phone_num":
        /* returns "false" if not a number */
        if (
          (kdEvent.shiftKey || kdEvent.keyCode < 48 || kdEvent.keyCode > 57) &&
          (kdEvent.keyCode < 96 || kdEvent.keyCode > 105)
        ) {
          return false;
        }
        break;
      case "full_name":
        /* returns "false" if Forbidden Symbol or more then 1 space */
        var nameAllowedSymbols = /[a-zA-Z\u0600-\u06FF\s]/,
          space_count = (fieldValue.match(/\s/g) || []).length,
          keyPressed = kdEvent.originalEvent.key;
        if (
          !nameAllowedSymbols.test(keyPressed) ||
          (space_count >= 2 && /\s/g.test(keyPressed))
        ) {
          return false;
        }
        break;
      case "first_name":
      case "last_name":
        /* returns "false" if Forbidden Symbol or more then 1 space */
        var nameAllowedSymbols = /[a-zA-Z\u0600-\u06FF\s]/,
          space_count = (fieldValue.match(/\s/g) || []).length,
          keyPressed = kdEvent.originalEvent.key;
        if (
          !nameAllowedSymbols.test(keyPressed) ||
          (space_count >= 1 && /\s/g.test(keyPressed))
        ) {
          return false;
        }
        break;
    }
    return true;
  };
  leadFormFunc.prototype.validateField = function (field) {
    var validateRule = field.getAttribute("validateRule");
    switch (validateRule) {
      case "checkbox":
        if (!field.checked) {
          this.addError(field, "empty");
          return false;
        }
        return true;
      case "passnotmatch":
        if (field.value !== this.required_fields["pw"].value) {
          this.addError(field, validateRule);
          return false;
        }
        return true;

      default:
        var fieldVal = field.value;
        if (!fieldVal) {
          this.addError(field, "empty");
          return false;
        }
        var validateString = {
          name: function (name) {
            var nameReg = /^[a-zA-Z\u0600-\u06FF\s]+$/; /* a-zA-Z + Arabic */
            return nameReg.test(name) ? name.length >= 2 : false;
          },
          email: function (email) {
            var emailReg =
              /^[a-zA-Z0-9.’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
            return emailReg.test(email) ? email.length <= 48 : false;
          },
          phone: function (number) {
            var numberReg = /^[0-9]+$/;
            if (number.length < 7 && numberReg.test(number)) {
              return "short";
            } else if (!numberReg.test(number)) {
              return "regex";
            } else {
              return true;
            }
          },
          password: function (pw) {
            var pwReg = /^((?=.*\d)(?=.*[a-zA-Z])[a-zA-Z\d]+)$/g;
            return pwReg.test(pw) ? pw.length >= 7 : false;
          },
          country: function (countryID) {
            if (restrictedCountries.indexOf(countryID) >= 0) {
              return "restricted";
            }
            return true;
          },
        };
        if (validateString.hasOwnProperty(validateRule)) {
          var validateResult = validateString[validateRule](fieldVal);
          if (validateResult !== true) {
            var errType = validateResult
              ? validateRule + "-" + validateResult
              : validateRule;

            this.addError(field, errType);
            return false;
          }
        }
        this.saveField(field.getAttribute("name"), fieldVal);
        return true;
    }
  };
  leadFormFunc.prototype.validateFields = function () {
    this.error = false;
    this.hideErrors();

    for (var fieldName of Object.keys(this.required_fields)) {
      var field = this.required_fields[fieldName];
      if (!this.validateField(field)) {
        this.error = true;
      }
    }

    if (!this.error) {
      this.getToken();
    }
  };
  leadFormFunc.prototype.saveField = function (fieldName, fieldVal) {
    if (fieldVal != undefined && fieldVal.length > 0) {
      localStorage.setItem(fieldName, fieldVal);
    }
  };
  leadFormFunc.prototype.addError = function (elem, errType) {
    var errType = errType || "";
    var formRow = $(elem).parents(".lead-form__data-item");
    formRow.addClass("error").attr("error-type", errType);
    if (errType == "empty" && $(elem).attr("errPlaceholder")) {
      $(elem).attr("placeholder", $(elem).attr("errPlaceholder"));
    }
  };
  leadFormFunc.prototype.showGlobalError = function () {
    this.addError(
      this.$form.find(".lead-form__tooltip_global-error")[0],
      "global-error"
    );
  };
  leadFormFunc.prototype.hideErrors = function (elem) {
    var fieldsToHide = elem
      ? $(elem).parents(".error")
      : this.$form.find(".error");
    fieldsToHide.removeClass("error").removeAttr("error-type");
  };
  leadFormFunc.prototype.getToken = function () {
    $(".lead-form-submit").attr("disabled", true);

    $.ajax({
      url: "https://api.royariyal.com/api/leads/token",
      type: "GET",
      dataType: "json",
      context: this,
      success: function (res) {
        this.createUser(res.csrf);
      },
      error: function (result) {
        $(".lead-form-submit").attr("disabled", false);
        this.handleErrorResponse(result.responseText);
      },
      timeout: 3000,
    });
  };
  leadFormFunc.prototype.createUser = function (csrf) {
    if ($('[name="full_name"]', this.$form).length) {
      var fullNameParts = $('[name="full_name"]', this.$form)
        .val()
        .trim()
        .split(" ");
      var firstNameVal = fullNameParts.shift();
      var lastNameVal = fullNameParts.length
        ? fullNameParts.join("_")
        : "nolastname";
    } else {
      var firstNameVal = $('[name="first_name"]', this.$form).val();
      var lastNameVal = $('[name="last_name"]', this.$form).val();
    }

    var phoneNum = $("[name=phone_num]", this.$form).val();
    var countryPrifix = $("[name=country_prefix]", this.$form)
      .val()
      .substring(1);

    var dataObj = {
      csrf: csrf,
      first_name: firstNameVal,
      last_name: lastNameVal,
      user_email: $("[name=user_email]", this.$form).val().toLowerCase(),
      phone_num: phoneNum,
      country_prefix: countryPrifix,
      full_phone: countryPrifix + phoneNum,
      country: +$("[name=country]", this.$form).val(),
      brandId: globalOptions.brand,
      language: globalOptions.lang,
      pixels: [0] /* [] causes all pixel to fire. ToDo */,
    };

    if ("subCampaign" in globalOptions) {
      dataObj["sub_campaign"] = globalOptions["subCampaign"];
    }

    var marketingParams = "";
    if ("campaignID" in globalOptions) {
      marketingParams += "&campaign_id=" + globalOptions["campaignID"];
    }
    if ("voluumCid" in globalOptions) {
      marketingParams += "&subc=" + globalOptions["voluumCid"];
      dataObj["pixels"].push(1257);
    }
    dataObj["marketing_params"] = marketingParams.substring(1);

    $.ajax({
      type: "POST",
      url: "https://api.royariyal.com/api/leads",
      contentType: "application/json",
      data: JSON.stringify(dataObj),
      dataType: "json",
      context: this,
      success: function (result) {
        this.handleSuccessResponse(result);
      },
      error: function (result) {
        this.handleErrorResponse(result.responseText);
      },
      complete: function () {
        $(".lead-form-submit").attr("disabled", false);
      },
    });
  };
  leadFormFunc.prototype.handleSuccessResponse = function (responseData) {
    if (typeof fbq !== "undefined") {
      fbq("track", "Lead");
      console.log("FBQLeadFired!");
    }
    if (typeof gtag !== "undefined" && globalOptions.googleAds) {
      var gAdsIdParts = globalOptions.googleAds.split("/");
      if (gAdsIdParts[1]) {
        gtag("event", "conversion", { send_to: globalOptions.googleAds });
        console.log("googleAdsConversionFired!");
      }
    }

    if (globalOptions.noRedirectBrand) {
      $(document).trigger("showNoRedirectPopup");
    } else {
      window.setTimeout(function () {
        window.location.href = responseData.meta.redirectTo;
      }, 500);
    }
  };
  leadFormFunc.prototype.handleErrorResponse = function (responseText) {
    try {
      var responseObj = JSON.parse(responseText);
    } catch (error) {
      console.warn(error);
      this.showGlobalError();
      return;
    }

    var errorType = responseObj.errors.type;

    if (
      errorType === "ERROR_EMAIL_DUPLICATE" ||
      errorType === "ERROR_EMAIL_INVALID"
    ) {
      this.addError(this.required_fields["user_email"], "email-existing");
    } else if (errorType === "ERROR_COUNTRY_BLOCKED") {
      this.addError(this.required_fields["country"], "country-restricted");
    } else if (errorType === "ERROR_MOBILE_INVALID") {
      this.addError(this.required_fields["phone_num"], "phone-short");
    } else {
      console.warn(responseObj.errors.message);
      this.showGlobalError();
    }
  };
  window.leadFormFunc = leadFormFunc;
})();

var leadFormsArr = [];

$(document).ready(function () {
  $(".lead-form").each(function (i, item) {
    leadFormsArr.push(new leadFormFunc(item));
  });

  var getGeoInfo = $.Deferred();
  var getCountryList = $.Deferred();

  $.when(getGeoInfo, getCountryList).then(function () {
    leadFormsArr.forEach(function (formObj) {
      formObj.initCountryList();
    });
  });

  var getLocalCountryList = function () {
    return $.getJSON(
      window.funnelOptions.pathPrefix + "global/data/countries.json",
      function (result) {
        window.countryList = result;

        getCountryList.resolve();
      }
    );
  };

  $.ajax({
    url: "https://api.royariyal.com/api/visitor-country",
    type: "GET",
    dataType: "json",
    success: function (result) {
      window.geoIpData = result;
      $(document).trigger("geoReady", result);
    },
    complete: getGeoInfo.resolve,
    timeout: 3000,
  });
  $.ajax({
    url:
      "https://api.royariyal.com/api/brands/" +
      window.funnelOptions.brand +
      "/country/allowed",
    type: "GET",
    dataType: "json",
    success: function (result) {
      window.countryList = result;
      getCountryList.resolve();
    },
    error: getLocalCountryList,
    timeout: 3000,
  });
});
