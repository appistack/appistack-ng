angular.module('app.utils', [])
  .controller('MessageModalCtrl', function($scope, $modalInstance, modalOpts) {
    $scope.title = modalOpts.title || 'Voxxel';
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