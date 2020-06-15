'use strict';
app.factory('cancelreservationService', ['$http', '$q', 'localStorageService', 'servicesConnect', function ($http, $q, localStorageService, servicesConnect) {

    var serviceBase = servicesConnect.apiFutbolPlay;
    var cancelreservationService = {};

    var authData = localStorageService.get('authorizationData');

    if (authData) {

        var _ListCancelReservations = function (id_place) {
            var deferred = $q.defer();
            $http.get(serviceBase + 'api/reservations/cancelreservation/' + id_place + '/'+ '20', { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function (results) {
                deferred.resolve(results);
            }, function errorCallback(err, status) {
                deferred.reject(err);
            });
            return deferred.promise;
        }

        cancelreservationService.getCancelReservation = _ListCancelReservations;
    }

    return cancelreservationService;

}]);
