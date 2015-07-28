angular.module('app.auth', [])
  .controller('PasswordResetCtrl', function($scope, $auth, messageModal) {
      $scope.onRequestPasswordReset = function() {
        $auth.requestPasswordReset($scope.resetPasswordForm)
          .then(function(res) {
            messageModal.open({
              title: 'Voxxel Password Reset Sent',
              icon: 'fa-lock',
              message: res.data.message
            });
          })
          .catch(function(res) {
            //TODO: set message to `res.data.errors[0]`?  the error message is sent in the API response anyways
            messageModal.open({
              title: 'Voxxel Password Reset Error!',
              icon: 'fa-lock',
              message: 'An error occurred when requesting a password reset.'
            });
          });
      }
  })

  .controller('PasswordChangeCtrl', function($scope, $state, $auth, messageModal) {
    $scope.onUpdatePassword = function() {
      $auth.updatePassword($scope.updatePasswordForm)
        .then(function(res) {
          $scope.updatePasswordAlerts = [];
          messageModal.open({
            title: 'Voxxel Password Updated',
            icon: 'fa-lock',
            message: 'Password updated successfully.'
          });
          $state.go('home');
        })
        .catch(function(res) {
          if (res.status == 401) {
            //A 401 on DeviseTokenAuth password reset indicates a user was trying to change the password for another user
            $scope.updatePasswordAlerts = [{type: "error", msg: "Couldn't update password."}]
          }
          if (res.status == 422) {
            $scope.updatePasswordAlerts = _.map(res.data.errors.full_messages, function(msg) {
              return {type: "error", msg: msg};
            });
          }

          messageModal.open({
            title: 'Voxxel Password Update Error',
            icon: 'fa-lock',
            message: 'There was an error updating your password.'
          });
        })
    }
  })

  .run(function ($rootScope, $state, messageModal) {
    $rootScope.user = $rootScope.user || {};
    $rootScope.loggedIn = $rootScope.loggedIn || false;

    function setLoggedOut() {
      $rootScope.user = {};
      $rootScope.loggedIn = false;
    }

    function loginSuccess(ev, user) {
      $rootScope.user = user;
      $rootScope.loggedIn = true;
    }

    function loginError(ev, reason) {
      setLoggedOut();
    }

    function logoutSuccess(ev) {
      setLoggedOut();
      $state.go('home');
    }

    function logoutError(ev, reason) {
      console.log([ev, reason]);
    }

    $rootScope.$on('auth:login-success', loginSuccess);
    $rootScope.$on('auth:login-error', loginError);
    $rootScope.$on('auth:validation-success', loginSuccess);
    $rootScope.$on('auth:validation-error', loginError);
    $rootScope.$on('auth:logout-success', logoutSuccess);
    $rootScope.$on('auth:logout-error', logoutError);

    $rootScope.$on('auth:registration-email-success', function (ev, message) {
      messageModal.open({
        title: 'Voxxel Account Created!',
        icon: 'fa-user',
        message: 'A registration email has been sent to ' + message.email + '.  Click the confirmation link activate your account.'
      });
    });

    $rootScope.$on('auth:email-confirmation-success', function (ev, user) {
      messageModal.open({
        title: 'Voxxel Account Activated!',
        icon: 'fa-user',
        message: 'Your account has been activated.'
      });
    });

    $rootScope.$on('auth:email-confirmation-error', function (ev, reason) {
      messageModal.open({
        title: 'Voxxel Account Confirmation Error!',
        icon: 'fa-warning',
        message: 'Could not activate your account!' // + reason
      });
      //TODO: provide mechanism to resend activation email
    });

    $rootScope.$on('auth:password-reset-confirm-success', function (ev, user) {
      messageModal.open({
        title: 'Voxxel Password Reset',
        icon: 'fa-lock',
        message: 'Please choose a new password.'
      });
    });

    $rootScope.$on('auth:password-reset-confirm-error', function (ev, reason) {
      messageModal.open({
        title: 'Voxxel Password Reset Error!',
        icon: 'fa-warning',
        message: 'An error occured.' // + reason?
      });
      //TODO: provide mechanism to resend password reset email
    });
  });
