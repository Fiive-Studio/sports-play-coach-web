'use strict';
app.factory('changepasswordService', ['$http', '$q', 'localStorageService', 'servicesConnect', function ($http, $q, localStorageService, servicesConnect) {

    var changepasswordService = {};
    var serviceBase = servicesConnect.apiFutbolPlay;

    var _changepassword = function (password_new, password_old, id_place) {
        var data = "password_new=" + password_new + "&password_old=" + password_old;
        var deferred = $q.defer();
        $http.put(serviceBase + 'api/customers/access/' + id_place, data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function (results) {
            deferred.resolve(results);
        }, function errorCallback(err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    changepasswordService.changepassword = _changepassword;

    return changepasswordService;
}]);