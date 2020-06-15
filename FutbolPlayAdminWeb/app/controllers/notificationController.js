'use strict';
app.controller('notificationController', ['$scope', '$route', '$location', 'authService', 'notificationService', 'localStorageService', '$window', function ($scope, $route, $location, authService, notificationService, localStorageService, $window) {

    $scope.notifications = [];
    $scope.reservationStatusNotification = [];
    $scope.selectedReservationStatusNotification = "2";
    $scope.FormatHour = "";
    var authData = localStorageService.get('userCustomerData');

    $scope.isPopupVisible = false;
    $scope.showNotifications = function () {
        updateNotifications();
        $("#notificationContainer").fadeToggle(600);
        $scope.isPopupVisible = !$scope.isPopupVisible;


        if ($scope.isPopupVisible) {

            $window.onclick = function (event) {
                var clickedElement = event.target;
                if (!clickedElement) return;

                var elementClasses = clickedElement.classList;
                var clickedOnSearchDrawer;

                if (elementClasses.value == 'fa fa-bell')
                { clickedOnSearchDrawer = true; }

                if (!clickedOnSearchDrawer) {
                    $scope.isPopupVisible = !$scope.isPopupVisible;
                    $window.onclick = null;
                    $scope.$apply();
                }
            }
        } else {
            $window.onclick = null;
        }
    }

    $scope.authentication = authService.authentication;

    if ($scope.authentication.isAuth)
    {
        var popUpForTime = setInterval(myTimer, 300000);
        function myTimer() {
            updateNotifications();
        }

        // Actualizar notificacion la primera vez que carga el controlador
        updateNotifications();

        // Muestra el contenido de las notificaciones
        $scope.showNotification = function (n) {
            $("#notificationContainer").fadeToggle(600);
            $scope.reservaNotification = "";
            $scope.fechaNotification = "";
            $scope.horaNotification = "";
            $scope.valorNotification = "";
            $scope.nombreNotification = "";
            $scope.celularNotification = "";
            $scope.CanchaNotification = "";

            $("#saveChangeStatusNotification").show();

            notificationService.listStatus().then(function (result) {
                $scope.reservationStatusNotification = result.data;
            }, function (error) {
                if (error.status == 401) { authService.logOut(); $location.path('/login'); }
            });

            // Consultar datos detallados de la reserva
            notificationService.getDetail(n.id_reservation).then(function (result) {
                if (result.status != 200) {
                    $scope.message = "Upps! Lo siento, creo que tenemos un error al consultar detalle de la reserva.";
                    console.log(result);
                }
                else {
                    $.each(result.data, function (index, item) {
                        $scope.reservaNotification = item.id_reservation;
                        $scope.fechaNotification = moment(n.date).format("YYYY-MM-DD");
                        $scope.horaNotification = GetHour(item.hour.split(":")[0], item.hour.split(":")[0], item.hour.split(":")[1]);
                        $scope.valorNotification = item.value;
                        $scope.nombreNotification = item.name;
                        $scope.celularNotification = item.phone;
                        $scope.CanchaNotification = item.description;
                    });
                }
                $("#VerDetalleNotificacion").modal("show");
            }, function (error) {
                if (error.status == 401) { authService.logOut(); $location.path('/login'); }
            });
        }

        // Metodo que limpia los input dentro del modal
        $scope.limpiarVerDetalleNotification = ClearInputModalNotification();

        $scope.confirmReservation = function () {
            $scope.selectedReservationStatusNotification = "2";
            var retVal = confirm("¿Esta seguro que desea confirmar la reserva?")
            if (retVal == true) {
                saveStatusNotification();
            }

            ClearInputModalNotification();
        }

        $scope.cancelReservation = function () {
            $scope.selectedReservationStatusNotification = "4";
            var retVal = confirm("¿Esta seguro que desea cancelar la reserva?")
            if (retVal == true) {
                saveStatusNotification();
            }

            ClearInputModalNotification();
        }

        $scope.activeChangeStatusNotification = function (item) {
            var codeStatus = $scope.selectedReservationStatusNotification;
            var nameStatus = $.grep($scope.reservationStatusNotification, function (item) {
                return item.id_status == codeStatus;
            })[0].name;
            //alert("Selected Value: " + codeStatus + "\nSelected Text: " + nameStatus);           
        }

        // Cuando se da clic en reservar y despues se cierra sin reservar, 
        // es para limpiar los datos de los input
        $scope.closeDetail = function () {
            $scope.numeroCelularReserva = "";
            $scope.emailReserva = "";
            $scope.hourReserva = "";
            $scope.canchaReserva = "";
            $scope.idUser = "";
            $scope.$broadcast('angucomplete-alt:clearInput');
        }

    }

    // Cuando el cliente cambia el estado de una reserva
    function saveStatusNotification() {
        // Consultar datos detallados de la reserva
        notificationService.saveStatus($scope.selectedReservationStatusNotification, $scope.reservaNotification).then(function (result) {
            updateNotifications();
        }, function (error) {
            if (error.status == 401) { authService.logOut(); $location.path('/login'); }
        });
    }

    // Metodo que calcula la forma de mostrar los horarios en la grilla
    function GetHour(hourToShow, currentHour, minutes) {

        if (hourToShow > 12) { hourToShow = hourToShow - 12; }
        var time = null, ampm = " am";
        if (currentHour >= 12 && currentHour <= 23 || currentHour == 11 && hourToShow == 12) { ampm = " pm"; }
        time = hourToShow + ":" + minutes + ampm;
        return time;
    }

    // Limpiar modal
    function ClearInputModalNotification() {
        $scope.reservaNotification = "";
        $scope.fechaNotification = "";
        $scope.horaNotification = "";
        $scope.valorNotification = "";
        $scope.nombreNotification = "";
        $scope.celularNotification = "";
        $scope.CanchaNotification = "";
    };

    function hideCountNotifications() {
        $("#notification_count").fadeOut("slow");
        $('#notificationLink > i.fa-bell').addClass('fa-bell-o');
        $('#notificationLink > i.fa-bell').removeClass('fa-bell');
    }

    function updateNotifications() {

        notificationService.getPendingReservations(authData.id_place).then(function (results) {
            if (results.status != 200) {
                $scope.message = "Upps! Lo siento, creo que tenemos un problema al cargar las notificaciones.";
                console.log(results);
            }
            else {
                $scope.notifications = results.data;
                $scope.cantPendingReservations = results.data.length;

                //// La primera vez que carga la pagina se llamada el metodo para que recargue la grilla
                //reloadGrid();
            }
            //$scope.$emit('UNLOAD')
            //$("#tableScheduler").show();

        }, function (error) {
            if (error.status == 401) { authService.logOut(); $location.path('/login'); }
        });
    }

}]);