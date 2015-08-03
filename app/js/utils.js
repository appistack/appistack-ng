angular.module('app.utils', [])
  .directive('showErrors', function() {
    return {
      restrict: 'A',
      require: '^form', //require a parent form element
      link: function(scope, el, attrs, formCtrl) {
        var inputEl = el[0].querySelector("[name]"); //find the textbox element within the form-group
        var inputNgEl = angular.element(inputEl); //convert native textbox to an angular element
        var inputName = inputNgEl.attr('name'); //get the name on the text box, so we know the property to check for on the model

        inputNgEl.bind('blur', function() {
          el.toggleClass('has-error', formCtrl[inputName].$invalid);
        })
      }
    }
  })

  .controller('MessageModalCtrl', function($scope, $modalInstance, modalOpts, ENV) {
    $scope.title = modalOpts.title || ENV.title;
    $scope.icon = modalOpts.icon;
    $scope.message = modalOpts.message;

    $scope.ok = function() {
      $modalInstance.close();
    }
  })

  .service('messageModal', function($modal) {
    this.open = function(modalOpts) {
      var modalInstance = $modal.open({
        templateUrl: 'modals/message-modal.html',
        controller: 'MessageModalCtrl',
        resolve: {
          modalOpts: function() { return modalOpts; }
        }
      });
    };
  });