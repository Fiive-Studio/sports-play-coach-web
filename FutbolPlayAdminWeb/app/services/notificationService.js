'use strict';
app.factory('notificationService', ['$http', '$q', 'localStorageService', 'servicesConnect', function ($http, $q, localStorageService, servicesConnect) {

    var serviceBase = servicesConnect.apiFutbolPlay;
    var notificationService = {};

    var _DetailReservation = function (id_reservation) {
        //console.log("Entro la reserva numero: " + id_reservation);
        var deferred = $q.defer();
        $http.get(serviceBase + 'api/reservations/detail/' + id_reservation, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function (results) {
            deferred.resolve(results);
        }, function errorCallback(err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    var _ListPendingReservations = function (id_place) {
        var deferred = $q.defer();
        $http.get(serviceBase + 'api/reservations/customer/myreservations/' + id_place, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function (results) {
            deferred.resolve(results);
        }, function errorCallback(err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    var _ListStatus = function () {
        var deferred = $q.defer();
        $http.get(serviceBase + 'api/status_type/customers', { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function (results) {
            deferred.resolve(results);
        }, function errorCallback(err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    var _SaveNewStatus = function (status, id_reservation) {
        var deferred = $q.defer();
        var data = "status=" + status + "&id_reservation=" + id_reservation;
        $http.post(serviceBase + 'api/reservations/changestatus', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function (results) {
            deferred.resolve(results);
        }, function errorCallback(err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    notificationService.getPendingReservations = _ListPendingReservations;
    notificationService.getDetail = _DetailReservation;
    notificationService.listStatus = _ListStatus;
    notificationService.saveStatus = _SaveNewStatus;

    return notificationService;

}]);