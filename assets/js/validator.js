function Validator(options) {
  // Lấy mặc định node cha
  function getParentElement(element, selector) {
    while (element.parentElement) {
      // matches kiếm tra selector
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRules = {};

  //Hàm thực hiện Validate
  function validate(inputElement, rule) {
    var errorElement = getParentElement(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);
    // Lấy danh sách các rules của selector
    var rules = selectorRules[rule.selector];
    var errorMessage;

    //Kiểm tra theo thứ tự lần lượt
    //Nếu chưa thỏa mãn thì dừng lại luôn
    for (let index = 0; index < rules.length; index++) {
      errorMessage = rules[index](inputElement.value);
      if (errorMessage) {
        break;
      }
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParentElement(inputElement, options.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      errorElement.innerText = "";
      getParentElement(
        inputElement,
        options.formGroupSelector
      ).classList.remove("invalid");
    }

    return !!errorMessage;
  }

  var formElement = document.querySelector(options.form);
  if (formElement) {
    //Bắt event submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = false;
      //Thực hiện validate tất cả các rule
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (isValid) {
          isFormValid = true;
        }
      });

      if (isFormValid) {
        console.log("Vui lòng nhập đúng thông tin.");
      } else {
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll(
            "[name]:not([disabled])"
          );
          console.log(enableInputs);
          var formValues = Array.from(enableInputs).reduce((values, input) => {
            values[input.name] = input.value;
            return values;
          }, {});
          options.onSubmit(formValues);
        }
      }
    };

    //Thực hiện lặp trên từng element của rules
    options.rules.forEach(function (rule) {
      // Lưu lại các rules cho mỗi input:
      //   - Nếu nó đã tồn tại 1 rule rồi thì sẽ push hoặc ngược lại
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElement = formElement.querySelector(rule.selector);
      if (inputElement) {
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };
      }

      inputElement.oninput = function () {
        var errorElement = getParentElement(
          inputElement,
          options.formGroupSelector
        ).querySelector(".form-message");
        errorElement.innerText = "";
        getParentElement(
          inputElement,
          options.formGroupSelector
        ).classList.remove("invalid");
      };
    });
  }
}

Validator.isRequired = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim() ? undefined : "Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Trường này phải là email!";
    },
  };
};

Validator.minLength = function (selector, min) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : `Vui lòng nhập ít nhất ${min} kí tự.`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "Giá trị nhập vào không chính xác";
    },
  };
};
