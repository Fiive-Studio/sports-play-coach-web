'use strict';
app.factory('profileService', ['$http', '$q', 'localStorageService', 'servicesConnect', function ($http, $q, localStorageService, servicesConnect) {

    var serviceBase = servicesConnect.apiFutbolPlay;
    var profileService = {};
    var authData = localStorageService.get('userCustomerData');

    var _updateUser = function (dataUser) {
        var data = "email=" + dataUser.email + "&full_name=" + dataUser.name;
        var deferred = $q.defer();
        $http.put(serviceBase + 'api/customers/' + authData.iduser, data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function (results) {
            deferred.resolve(results);
        }, function errorCallback(err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    var _findUser = function () {
        var deferred = $q.defer();
        $http.get(serviceBase + 'api/customers/' + authData.iduser, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function (results) {
            deferred.resolve(results);
        }, function errorCallback(err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    profileService.updateUser = _updateUser;
    profileService.findUser = _findUser;

    return profileService;
}]);