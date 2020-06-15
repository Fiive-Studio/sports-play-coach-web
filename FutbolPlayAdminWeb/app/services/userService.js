'use strict';
app.factory('userService', ['$http', '$q', 'localStorageService', 'servicesConnect', function ($http, $q, localStorageService, servicesConnect) {

    var serviceBase = servicesConnect.apiFutbolPlay;
    var userService = {};

    var authData = localStorageService.get('authorizationData');

    if (authData) {

        var _ListUserByPlace = function (id_place) {
            var deferred = $q.defer();
            $http.get(serviceBase + 'api/users_offline/getbyplace/' + id_place, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function (results) {
                deferred.resolve(results);
            }, function errorCallback(err, status) {
                deferred.reject(err);
            });
            return deferred.promise;
        }

        var _InfoUser = function (id_user) {
            var deferred = $q.defer();
            $http.get(serviceBase + 'api/users_offline/' + id_user, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function (results) {
                deferred.resolve(results);
            }, function errorCallback(err, status) {
                deferred.reject(err);
            });
            return deferred.promise;
        }

        var _UpdateUser = function (id_user, id_users_offline, name, phone, email, id_place) {
            var deferred = $q.defer();
            var data = "id_users_offline=" + id_users_offline + "&name=" + name + "&phone=" + phone + "&email=" + email + "&id_place=" + id_place;
            $http.put(serviceBase + 'api/users_offline/' + id_user, data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function (results) {
                deferred.resolve(results);
            }, function errorCallback(err, status) {
                deferred.reject(err);
            });
            return deferred.promise;
        }

        userService.getUserByPlace = _ListUserByPlace;
        userService.getUserInfo = _InfoUser;
        userService.updateUser = _UpdateUser;
    }

    return userService;

}]);
