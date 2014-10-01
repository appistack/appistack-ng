angular.module('app',
    ['ngRoute',
      'ngCookies',
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

      // states: unauthenticated
      // home - / - prompt to signup
      // features - /features - overview of product
      // explore - /explore - top patches and trending vsts
      // blog - /blog - blog posts

      // states: authenticated
      // home - / - dashboard
      // profile - /:username
      // account - /account

      // TODO: enable pushstate (fix heroku lineman build pack)
      // $locationProvider.html5Mode(true);

      $urlRouterProvider.otherwise('/home');

      function authRoute($auth) {
        return $auth.validateUser();
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

          //TODO: redirect unauthenticated routes to the home state, then open the login modal

          // authenticated routes
          // TODO: /followers
          // TODO: /following
          // TODO: /top/sounds
          // TODO: /top/users
          // TODO: /users/:id
          // TODO: /artists/:id/sounds
          // TODO: /artists/:id/bytes

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
          })
      
          ;

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
