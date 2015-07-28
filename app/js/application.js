angular.module('app',
    ['ipCookie',
      'ngResource',
      'restangular',
      'ui.bootstrap',
      'ui.router',
      'ng-token-auth',
      'app.auth',
      'ui.gravatar',
      'angulartics',
      'angulartics.google.analytics'])

    .config(function ($stateProvider, $locationProvider, $urlRouterProvider, gravatarServiceProvider) {

      // NOTE: If you're going to use html5 pushstate, you'll need to configure your webserver(s) to route to index.html, except for static assets
      $locationProvider.html5Mode(true);
      $urlRouterProvider.otherwise('/home');

      function authRoute($auth, $state, $rootScope) {
        return $auth.validateUser()
          .catch(function(res) {
            //TODO: also open the login modal
            $state.go('home');
            $rootScope.$emit('navbar:openLoginModal');
          });
      }

      $stateProvider
          .state('home', {
            url: "/home",
            templateUrl: "home.html",
            controller: 'HomeCtrl'
          })

          .state('error', {
            url: "/error",
            templateUrl: "error.html",
            controller: 'HomeCtrl'
          })

          .state('users', {
            url: "/users",
            templateUrl: "users/index.html",
            controller: function ($scope, users) {
              $scope.users = users;
            },
            resolve: {
              auth: authRoute,
              users: function(Users) {
                return Users.getList();
              }
            }
          })

          .state('users-profile', {
            url: '/users/{userId:int}',
            templateUrl: 'users/profile.html',
            controller: function ($scope, user) {
              $scope.user = user;
            },
            resolve: {
              auth: authRoute,
              user: function($stateParams, Users) {
                return Users.one($stateParams.userId).get();
              }
            }
          })

          .state('users-profile-edit', {
            url: '/users/{userId:int}/edit',
            templateUrl: 'users/edit.html',
            controller: function ($scope, $state, user) {
              $scope.user = user;
              $scope.submit = function() {
                $scope.user.save().then(function(res) {
                  $state.go('users-profile', {userId: $scope.user.id});
                });
              };
            },
            resolve: {
              auth: authRoute,
              user: function($stateParams, Users) {
                return Users.one($stateParams.userId).get();
              }
            }
          })

          .state('sounds.detail', {
            url: "/sounds/{soundId:int}",
            templateUrl: "sounds/detail.html",
            controller: function($scope, Sounds) {

            },
            resolve: {
              auth: authRoute
            }
          })

          .state('sounds.detail.sound', {

          })

          .state('artists', {
            url: "/artists",
            abstract: true,
            template: '<ui-view/>',
            resolve: {
              auth: authRoute
            }
          })

          .state('artists.list', {
            url: "/list",
            templateUrl: "artists/index.html",
            resolve: {
              artists: function (Artists) { return Artists.getList(); }
            },
            controller: function ($scope, artists) {
              $scope.artists = artists;
            }
          })

          //TODO: change artist urls to reference their name
          .state('artists.detail', {
            url: '/{artistId:int}',
            templateUrl: "artists/detail.html",
            resolve: {
              artist: function ($stateParams, Artists) { return Artists.one($stateParams.artistId).get(); },
              audio: function (SpectrogramAudio) { return SpectrogramAudio; },
              mic: function (SpectrogramMic) { return SpectrogramMic; }
            },
            controller: 'SpectroCtrl'
          })

          .state('artists.detail.sound', {
            url: '/sounds/{soundId:int}',
            templateUrl: "artists/sound.html",
            resolve: {
              sound: function ($stateParams, Sounds) { return Sounds.one($stateParams.soundId).get(); }
            },
            controller: 'SpectroSoundsCtrl'
          });

      gravatarServiceProvider.defaults = {
        size: 100,
        default: 'retro'
      };
    })

    .constant('ENV', {
      //TODO: update so host is separate from url
      apiHost: '<%= api_protocol %>://<%= api_url %>',
      apiUrl: '<%= api_protocol %>://<%= api_url %>/api/v1'
    })

    .config(function(RestangularProvider, ENV) {
      RestangularProvider.setBaseUrl(ENV.apiUrl);
      RestangularProvider.setDefaultHeaders({
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept': 'application/json,text/plain;version=1'
      })
    })

    .config(function($authProvider, ENV) {
      $authProvider.configure({
        apiUrl: ENV.apiHost,
        validateOnPageLoad: true,
        authProviderPaths: {
          google_oauth2: '/auth/google_oauth2'
        }
      });
    })

    .constant('USER_ROLES', {
      all: '*',
      admin: 'admin',
      guest: 'guest'
    })

    .run(function ($rootScope, $location) {

    });


window.requestAnimationFrame = (function (){
  return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function(cb, el) {
            window.setTimeout(cb, 1000 / 60)
          };
})();

window.AudioContext = window.AudioContext || window.webkitAudioContext;

navigator.getUserMedia =
    (navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);
