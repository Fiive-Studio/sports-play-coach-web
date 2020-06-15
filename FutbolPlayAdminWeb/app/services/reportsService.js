'use strict';
app.factory('reportsService', ['$http', '$q', 'localStorageService', 'servicesConnect', function ($http, $q, localStorageService, servicesConnect) {

    var serviceBase = servicesConnect.apiFutbolPlay;
    var reportsService = {};
    var authData = localStorageService.get('authorizationData');

    var _DataForReport = function (id_place) {
        var deferred = $q.defer();
        $http.get(serviceBase + 'api/reservation_report/' + id_place, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function (results) {
            deferred.resolve(results);
        }, function errorCallback(err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    reportsService.getDataReport = _DataForReport;
    return reportsService;

}]);
