angular.module('starter.services', ['LocalStorageModule'])
  .factory('Auth', function (localStorageService) {
    var _user = localStorageService.get('starter.user');
    var setUser = function (user) {
      _user = user;
      localStorageService.set('starter.user', _user);
    };
    return {
      setUser: setUser,
      isLoggedIn: function () {
        return _user ? true : false;
      },
      getUser: function () {
        return _user;
      },
      logout: function () {
        localStorageService.remove('starter.user');
        _user = null;
      }
    }
  });
