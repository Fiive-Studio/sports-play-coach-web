'use strict';
app.controller('cancelreservationController', ['$scope', 'cancelreservationService', 'localStorageService', 'NgTableParams', '$filter', function ($scope, cancelreservationService, localStorageService, NgTableParams, $filter) {

    $scope.listUsers = [];
    $scope.idUser;
    $scope.idPlace;
    $scope.filteredUsers = [];
    $scope.currentPage = 1;
    $scope.numPerPage = 5;
    $scope.maxSize = 4;
    $scope.cancelReservations = [];
    $scope.lastDayCancelReservation = 30;
    var authData = localStorageService.get('userCustomerData');

    // Se carga la primera vez el listado de usuarios cuando se inicializa el controlador
    $scope.loadCancelReservations = function () {
        cancelreservationService.getCancelReservation(authData.id_place, $scope.lastDayCancelReservation).then(function (result) {
            if (result.status != 200) {
                $scope.message = "Upps! Lo siento, creo que tenemos un error al consultar las canchas canceladas.";
                console.log(result);
            } else {
                var self = this;
                $scope.tableParams = new NgTableParams({ count: 25 }, { counts: [50, 100, 200], dataset: result.data });
                $.each(result.data, function (index, item) {
                    var cancelReser = { Nombre: $.trim(item.name), Telefono: $.trim(item.phone), Hora: item.hour, Fecha: item.date, Valor: item.value };
                    $scope.cancelReservations.push(cancelReser);
                });
            }
        }, function (error) {
            if (error.status == 401) { authService.logOut(); $location.path('/login'); }
        });
    }

    $scope.loadCancelReservations();
}]);