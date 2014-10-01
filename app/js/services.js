angular.module('app')
    .factory('RestDefaults', function(Restangular) {
      return Restangular.withConfig(function(RestangularConf) {
        RestangularConf.setRequestSuffix('.json');
      });
    })

    .factory('Users', function (RestDefaults, ENV) {
      var User = RestDefaults.service('users');
      RestDefaults.extendModel('users', function(model) {
        model.isAdmin = function() {
          return _.chain(this.roles)
            .map(function (r) { return r.name })
            .contains('admin')
            .value();
        };

        return model;
      });

      return User;
    })

    .factory('Sounds', function (RestDefaults, ENV) {
      return RestDefaults.service('sounds');
    })

    // TODO: figure out how to resolve order-of-dependencies problem
    // I.E. artists can reference sounds, but sounds can't reference artists
    .factory('Artists', function(RestDefaults, ENV) {
      return RestDefaults.service('artists');
    });
