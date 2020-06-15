'use strict';
app.controller('reservationController', ['$scope', '$route', '$location', 'reservationService', 'localStorageService', 'authService', 'authInterceptorService', 'notificationService', function ($scope, $route, $location, reservationService, localStorageService, authService, authInterceptorService, notificationService) {

    $scope.listUsers = [

    ];
    $scope.dataUserForReservation = [];
    $scope.selectUsers = [];
    $scope.Pitchs = [];
    $scope.Place = [];
    $scope.message = "";
    $scope.nameUserOffline = "";
    $scope.countColumn = "";
    $scope.dataColumn = [];
    $scope.busyPitch = [];
    $scope.horarios = [];
    $scope.FormatHour = "";
    $scope.selectedReservationStatus = null;
    $scope.reservationStatus = [];
    $scope.hourOriginal = "";
    $scope.userType = "";
    $scope.nameUserResevation = "";
    var fecha_reserva = "";

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    var d = new Date();
    moment.locale('es');
    var date = moment(d).format("YYYY-MM-DD");
    var diaActual = date;
    var authData = localStorageService.get('userCustomerData');

    $scope.dateNow = date;
    $scope.dateDisplay = moment($scope.dateNow).format("dddd") + ", " + moment($scope.dateNow).format("LL");

    // Metodo que captura cuando cambio la fecha
    $scope.onTimeSet = function (newDate, oldDate) {
        $("#tableScheduler").hide();
        $scope.$emit('LOAD');
        var fecha = newDate.toISOString().substring(0, 10);
        $scope.dateNow = fecha;
        $scope.dateDisplay = moment($scope.dateNow).format("dddd") + ", " + moment($scope.dateNow).format("LL");
        fecha_reserva = fecha;
        reservationService.getBusy(authData.id_place, fecha).then(function (result) {
            if (result.status != 200) {
                $scope.message = "Upps! Lo siento, creo que tenemos un error al consultar las canchas ocupadas.";
            }
            else {
                $scope.busyPitch = result.data;
                $scope.safeApply(function () {
                    reloadGridbyDate(fecha);
                });
                $scope.busyPitch = [];
            }
        });
        $scope.$emit('UNLOAD');
        $("#tableScheduler").show();

        // Notificaciones en pantalla
        //ShowNotificationUsersApp(authData.id_place, fecha);
    }

    // Metodo que actualiza los datos de la consulta actual
    $scope.reaload = function () {
        reloadGrid();
    }

    if (!authData) {
        $scope.logOut = function () {
            authService.logOut();
            $location.path('/login');
        }
    }
    else {

        var popUpForTime = setInterval(myTimer, 300000);
        function myTimer() {
            updateNotifications();
        }

        updateNotifications();

        // Cargamos una sola vez la informacion de los horarios para generar las filas de la grilla
        reservationService.getPlace(authData.id_place).then(function (result) {
            if (result.status != 200) {
                $scope.message = "Upps! Lo siento, creo que tenemos un problema al construir la grilla de horarios.";
                console.log(result);
            }
            else {
                $scope.horarios = result.data;
            }
        }, function (error) {
            if (error.status == 401) { authService.logOut(); $location.path('/login'); }
        });

        // Cargamos una sola vez la informacion de la cantidad de canchas del Place para generar las columas
        $scope.countColumn = 0;
        $("#tableScheduler").hide();
        $scope.$emit('LOAD')
        reservationService.getPitch(authData.id_place).then(function (results) {
            if (results.status != 200) {
                $scope.message = "Upps! Lo siento, creo que tenemos un problema al cargar tu listado de canchas.";
                console.log(results);
            }
            else {
                $scope.Pitchs = results.data;
                $scope.dataColumn = results.data;
                $scope.countColumn = results.data.length;

                // La primera vez que carga la pagina se llamada el metodo para que recargue la grilla
                reloadGrid();
            }
            $scope.$emit('UNLOAD')
            $("#tableScheduler").show();

        }, function (error) {
            if (error.status == 401) { authService.logOut(); $location.path('/login'); }
        });

        // Metodo que retorna el nombre de la cancha para cuando esta en dispositivos moviles.
        $scope.getNamePitch = function (idPitch) {
            var nombreCancha = "";
            $.each($scope.Pitchs, function (index, item) {
                if (item.id_pitch == idPitch) {
                    nombreCancha = item.description;
                }
            });
            return nombreCancha;
        }

        // Cuando se da clic en el boton disponible, se toman los datos y se abre el pop-up
        // para infresar los datos. 
        $scope.Reservar = function (pitch, hour) {
            if (fecha_reserva == "")
            { fecha_reserva = date; }

            $scope.FechaReserva = fecha_reserva;

            $scope.hourReserva = GetHour(hour, hour);
            $scope.hourOriginal = hour + ":" + $scope.FormatHour;
            $scope.canchaReserva = pitch;
            $scope.priceReserva;

            reservationService.getPrice(pitch, hour, fecha_reserva).then(function (result) {
                if (result.status != "200") {
                    $scope.message = "Upps! Lo siento, creo que tenemos un error al consultar el precio de la cancha.";
                } else {
                    if (result.data.length > 0) {
                        $.each(result.data, function (index, item) {
                            $scope.priceReserva = Number(item.value);
                        });
                    }
                }
            }, function (error) {
                if (error.status == 401) { authService.logOut(); $location.path('/login'); }
            });

            $("#reservar").modal("show");
        }

        // Cuando se da clic sobre un diferente de disponible
        $scope.VerDetalle = function (pitch, id_reserva, hour, source) {
            $scope.reserva = "";
            $scope.hora = "";
            $scope.valor = "";
            $scope.nombre = "";
            $scope.celular = "";
            $scope.Cancha = "";

            if (source == '2') {
                $("#messageChangeStatus").show();
                $scope.messageChangeStatus = "Cancha reservada en la opcion mutiple.";
                $("#changeStatusDiv").hide();
                $("#saveChangeStatus").hide();
            }
            else {
                $("#messageChangeStatus").hide();
                $("#changeStatusDiv").show();
                $("#saveChangeStatus").show();
                // Mostrar el listado de estados
                reservationService.listStatus().then(function (result) {
                    $scope.reservationStatus = result.data;
                }, function (error) {
                    if (error.status == 401) { authService.logOut(); $location.path('/login'); }
                });
            }

            // Consultar datos detallados de la reserva
            reservationService.getDetail(id_reserva).then(function (result) {
                if (result.status != 200) {
                    $scope.message = "Upps! Lo siento, creo que tenemos un error al consultar detalle de la reserva.";
                    console.log(result);
                }
                else {
                    $.each(result.data, function (index, item) {
                        $scope.reserva = item.id_reservation;
                        $scope.hora = GetHour(item.hour.split(":")[0], item.hour.split(":")[0]);
                        $('#updateValueViewReservation').val(Number(item.value));
                        $scope.valorReserva = Number(item.value);
                        $scope.nombre = item.name;
                        $scope.celular = item.phone;
                        $scope.Cancha = item.description;
                        $scope.statusActual = "";
                        $scope.idEstadoReservacionActual = item.status;

                        if (typeof item.reservation_description === 'undefined' || item.reservation_description == 'undefined') {
                            $('#updateObservationViewReservation').val(" ");
                        }
                        else {
                            $('#updateObservationViewReservation').val(item.reservation_description);
                        }

                        $.each($scope.reservationStatus, function (indexStatus, itemStatus) {
                            if (itemStatus.id_status == item.status)
                            { $scope.statusActual = itemStatus.name; }
                        });
                    });
                }
                $("#VerDetalle").modal("show");
            }, function (error) {
                if (error.status == 401) { authService.logOut(); $location.path('/login'); }
            });
        }

        // Cuando el cliente cambia el estado de una reserva
        $scope.activeChangeStatus = function (item) {
            var codeStatus = $scope.selectedReservationStatus;

            if (codeStatus != null) {
                var nameStatus = $.grep($scope.reservationStatus, function (item) {
                    return item.id_status == codeStatus;
                })[0].name;
            }
            //alert("Selected Value: " + codeStatus + "\nSelected Text: " + nameStatus);           
        }

        // Actualizar estado
        $scope.saveStatus = function () {
            // Consultar datos detallados de la reserva
            if ($scope.selectedReservationStatus != null) {

                var valueFormViewReservation = Number($('#updateValueViewReservation').val());
                var observationFormViewReservation = $('#updateObservationViewReservation').val();

                if (valueFormViewReservation == null) {
                    alert("Debes ingresar el precio.");
                }
                else {
                    if ((valueFormViewReservation == 0 || valueFormViewReservation == "" || typeof valueFormViewReservation === 'undefined') &&
                       (observationFormViewReservation == "" || typeof observationFormViewReservation === 'undefined')) {
                        alert("Como el precio ingresado es cero (0), debe ingresar el motivo en la opcion observaciones.");
                    }
                    else {
                        reservationService.saveStatus($scope.selectedReservationStatus, $scope.reserva, observationFormViewReservation, valueFormViewReservation).then(function (result) {
                            $('#VerDetalle').modal('toggle');
                            reloadGrid();
                        }, function (error) {
                            if (error.status == 401) { authService.logOut(); $location.path('/login'); }
                        });
                    }
                }
            }
            else {
                var valueFormViewReservation = Number($('#updateValueViewReservation').val());
                var observationFormViewReservation = $('#updateObservationViewReservation').val();
                var idEstadoReservacion = $scope.idEstadoReservacionActual;

                if (valueFormViewReservation == null) {
                    alert("Debes ingresar el precio.");
                }
                else {
                    if (valueFormViewReservation == 0 &&
                        (observationFormViewReservation == "" || typeof observationFormViewReservation === 'undefined')) {
                        alert("Como el precio ingresado es cero (0), debe ingresar el motivo en la opcion observaciones.");
                    }
                    else {
                        reservationService.saveStatus(idEstadoReservacion, $scope.reserva, observationFormViewReservation, valueFormViewReservation).then(function (result) {
                            $('#VerDetalle').modal('toggle');
                            reloadGrid();
                        }, function (error) {
                            if (error.status == 401) { authService.logOut(); $location.path('/login'); }
                        });
                    }
                }
            }
        }

        // Metodo que limpia los input dentro del modal
        $scope.limpiarVerDetalle = ClearInputModal();

        $scope.$broadcast('angucomplete-alt:changeInput', 'autocomplete-1', 'Hello!');

        // CARGAR DATOS DEL USUARIO EN POP-UP
        // Selectior de clientes
        $scope.selectedUserOffline = function (selected) {

            if (typeof selected === 'undefined') {
                $scope.dataUserForReservation = [];
            }
            else {
                $scope.disableInput = true;
                $scope.dataUserForReservation = selected.originalObject;
                $scope.numeroCelularReserva = Number($scope.dataUserForReservation.phone.trim());
                $scope.idUser = $scope.dataUserForReservation.id;
                $scope.userType = $scope.dataUserForReservation.id_user_type;

                if (typeof $scope.dataUserForReservation.email === 'undefined') {
                }
                else {
                    $scope.emailReserva = $scope.dataUserForReservation.email.trim();
                }
            }
        };

        $scope.clearInput = function (id) {
            if (id) {
                $scope.$broadcast('angucomplete-alt:clearInput', id);
                $scope.numeroCelularReserva = "";
                $scope.idUser = "";
                $scope.userType = "";
                $scope.emailReserva = "";
                $scope.disableInput = false;
            }
            else {
                $scope.$broadcast('angucomplete-alt:clearInput');
                $scope.numeroCelularReserva = "";
                $scope.idUser = "";
                $scope.userType = "";
                $scope.emailReserva = "";
                $scope.disableInput = false;
            }
        }

        $scope.localSearch = function (str) {
            //$scope.listUsers = [];
            var matches = [];

            if (str.length == 0) {
                return matches;
            }
            reservationService.getUserByNameAndIdPlace(str, authData.id_place).then(function (result) {
                if (result.status != 200) {
                    $scope.message = "Upps! Lo siento, creo que tenemos un error al consultar los usuarios.";
                    console.log(result);
                } else {
                    $scope.listUsers = result.data;
                }
            }, function (error) {
                if (error.status == 401) { authService.logOut(); $location.path('/login'); }
            });

            matches = $scope.listUsers;

            return matches;
        };

        // Validcion del formulario. Activa el boton Reservar
        $scope.validateForm = function () {

            // Si esta vacio es por que es un usuario nuevo
            if ($scope.idUser == "" || typeof $scope.idUser === 'undefined') {

                if (typeof $scope.nameUserOffline === 'undefined' || typeof $scope.numeroCelularReserva === 'undefined')
                { return true; }
                else
                {
                    if (typeof $scope.nameUserOffline == "" || typeof $scope.numeroCelularReserva == "")
                    { return true; }
                    else
                    {
                        if ($scope.nameUserOffline != null && $scope.nameUserOffline.length > 0 &&
                            $scope.numeroCelularReserva != null && $scope.numeroCelularReserva.toString().length > 0) {
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                }
            }
            else {
                return false;
            }
        }

        // Cuando se da clic en reservar y despues se cierra sin reservar, 
        // es para limpiar los datos de los input
        $scope.closereserva = function () {
            ClearDataModarReserva();
        }

        // Setea el valor del nombre ingresado en el input de autocompletar 
        // esto pasa cuando el usuario no existe y es un userOffline
        $scope.inputChanged = function (str) {
            $scope.nameUserOffline = str;
        }

        // Cuando doy click en un boton que dice disponible.
        $scope.reservarcancha = function () {
            $("#errorCreateUserOffline").html("");
            $scope.$emit('LOAD')
            var id_users = $scope.idUser;
            var id_pitch = $scope.canchaReserva;
            var hour = $scope.hourOriginal;
            var id_place = authData.id_place;
            var price = $scope.priceReserva;
            var userType = $scope.userType;
            var observaciones = $scope.observacionesReserva;

            if (price == null) {
                alert("Debes ingesar el precio.");
            }
            else {
                if ((price == 0 || price == "" || typeof price === 'undefined') && (observaciones == "" || typeof observaciones === 'undefined')) {
                    alert("Como el precio ingresado es cero (0), debe ingresar el motivo en la opcion observaciones.");
                }
                else {
                    if ($scope.idUser == "" || typeof $scope.idUser === 'undefined') {
                        var name = $scope.nameUserOffline.trim();
                        var phone = $scope.numeroCelularReserva;
                        var id_place = id_place;
                        var email = "";
                        userType = "2";

                        if (typeof $scope.emailReserva === 'undefined') {
                        }
                        else {
                            email = $scope.emailReserva.trim();
                        }

                        if (typeof observaciones === 'undefined') {
                            observaciones = "";
                        }

                        var expresion = /^3[\d]{9}$/;
                        if (isNaN(phone) || !expresion.test(phone)) {
                            alert("Debe ingresar un número con el formato correcto");
                        }
                        else {
                            reservationService.saveNewUser(name, phone, email, id_place).then(function (result) {
                                if (result.status == 201) {
                                    var id_users_offline = result.data.id_users_offline;
                                    reservationService.saveReservationUserOffline(fecha_reserva, id_users_offline, id_pitch, hour, id_place, price, userType, observaciones).then(function (result) {

                                        ClearInputModal();
                                        reloadGrid();
                                        $('#reservar').modal('toggle');

                                    }, function (error) {
                                        if (error.status == 409) {
                                            alert("Upps! otro usuario te gano. Esta reserva ya no esta disponible.");
                                        }
                                        if (error.status == 500) {
                                            alert("Upps! Parece que Arnoldo esta jugueteando de nuevo. Por favor contactate con nosotros.");
                                        }
                                        if (error.status == 404) {
                                            alert("Upps! Parece que esta cancha aun no esta programada para recibir reservas.");
                                        }
                                        if (error.status == 400) {
                                            alert("Upps! No se encontro programacion para la cancha seleccionada.");
                                        }
                                        if (error.status == 401) {
                                            authService.logOut(); $location.path('/login');
                                        }
                                    });
                                }
                                else {
                                    $scope.message = "Upps! Lo siento, creo que tenemos un error al guardar el nuevo usuario.";
                                }

                                $scope.nameUserOffline = "";
                                $scope.idUser = "";
                                $scope.userType = "";
                                $scope.canchaReserva = "";
                                $scope.hourOriginal = "";
                                $scope.numeroCelularReserva = "";
                                $scope.emailReserva = "";
                                $scope.$broadcast('angucomplete-alt:clearInput');

                            }, function (error) {
                                $scope.clearInput
                                if (error.status == 409) {
                                    $("#errorCreateUserOffline").show();
                                    $("#errorCreateUserOffline").html("<br><div class='alert alert-danger'>El numero de celular <strong>" + phone + "</strong> ya se encuentra registrado para otro usuario.</div>");
                                    $scope.$broadcast('angucomplete-alt:clearInput');
                                    $scope.numeroCelularReserva = "";
                                    $scope.idUser = "";
                                    $scope.userType = "";
                                    $scope.emailReserva = "";
                                    $scope.disableInput = false;
                                }
                                if (error.status == 401) {
                                    authService.logOut(); $location.path('/login');
                                }
                            });
                        }
                    }
                    else {
                        reservationService.saveReservationUserOffline(fecha_reserva, id_users, id_pitch, hour, id_place, price, userType, observaciones).then(function (result) {
                            if (result.status == 400) {
                                alert("Upps! otro usuario te gano. Esta reserva ya no esta disponible.");
                            }
                            else {
                                $('#reservar').modal('toggle');
                                reloadGrid();
                            }
                            ClearDataModarReserva();
                        }, function (error) {
                            if (error.status == 400) {
                                ClearDataModarReserva();
                                alert("Upps! parece que Arnoldo esta haciendo de las suyas. Dejanos arreglarlo.");
                            }
                            if (error.status == 401) { authService.logOut(); $location.path('/login'); }
                        });
                    }
                }
            }
            $scope.$emit('UNLOAD')
        }

    }

    // Metodo que actualiza los datos de la grilla a partir de una fecha
    function reloadGrid() {
        $scope.$emit('LOAD')
        reservationService.getBusy(authData.id_place, $scope.dateNow).then(function (result) {
            if (result.status != 200) {
                $scope.message = "Upps! Lo siento, creo que tenemos un error al consultar las canchas ocupadas.";
                console.log(result);
            }
            else {
                $scope.busyPitch = result.data;
                $scope.safeApply(function () {
                    reloadGridbyDate($scope.dateNow);
                });
                $scope.busyPitch = [];
            }
        }, function (error) {
            if (error.status == 401) { authService.logOut(); $location.path('/login'); }
        });
        $scope.$emit('UNLOAD');
    }

    // Metodo que carga y genera la grilla de las reservas
    function reloadGridbyDate(fecha) {
        var date = new Date(fecha);
        var day = date.getDay() + 1;

        if (day == 0) // Domingo
        { day = 7; }

        var startHour;
        var endHour;
        var countTimeAllow;
        var id_place;
        var rows = [];
        var colums = [];

        $.each($scope.horarios, function (index, item) {
            id_place = item.id_place;
            $scope.FormatHour = item.format_hour;
            $.each(item.hours, function (index, item) {
                if (item.id_day == day) {
                    startHour = item.hour_start.split(":")[0];
                    endHour = item.hour_end.split(":")[0];
                    countTimeAllow = endHour - startHour;
                    return false;
                }
            });
        });

        var currentHour = startHour;

        for (var i = 0; i <= countTimeAllow; i++) {

            var timeStart = GetHour(currentHour, currentHour);
            var timeEnd = GetHour(parseInt(currentHour) + 1, currentHour);

            rows.push({
                "hour": timeStart + " " + timeEnd,
                "pitches": []
            });

            for (var col = 0; col < $scope.countColumn; col++) {
                var busy = false;
                var statusBusy;
                var id_reservation;
                var id_source;
                var name;

                if (typeof $scope.dataColumn[col] === 'undefined') {
                    console.log("No cargo informacion de la columna");
                }
                else {
                    // Validamos si esta ocupado 
                    $.each($scope.busyPitch, function (index, item) {
                        var hour = item.hour.split(":")[0];
                        if (item.id_pitch == $scope.dataColumn[col].id_pitch && hour == currentHour) {
                            busy = true;
                            statusBusy = item.status;
                            id_reservation = item.id_reservation;
                            id_source = item.source;
                            name = item.name;
                            return false;
                        }
                    });

                    var id_pitch = $scope.dataColumn[col].id_pitch;

                    if (busy) {
                        rows[i].pitches.push({
                            id_pitch: id_pitch,
                            status: statusBusy,
                            id_reservation: id_reservation,
                            starthour: currentHour,
                            id_source: id_source,
                            name: name
                        });
                    }
                    else {

                        var strStatus = "";
                        var partDateNow = "";
                        var partDateSelect = "";
                        var f1 = "";
                        var f2 = "";
                        var partDateNow = diaActual.split('-');
                        var partDateSelect = fecha.split('-');
                        var f1 = new Date(partDateNow[0], partDateNow[1], partDateNow[2]);
                        var f2 = new Date(partDateSelect[0], partDateSelect[1], partDateSelect[2]);

                        if (f2 < f1)
                        { strStatus = "disable"; }
                        else
                        { strStatus = "free"; }

                        rows[i].pitches.push({
                            id_pitch: id_pitch,
                            status: strStatus,
                            id_reservation: "0",
                            starthour: currentHour,
                            id_source: "0",
                            name: ""
                        });
                        busy = false;
                    }
                }
            }
            currentHour++;
        }

        $scope.safeApply(function () {
            $scope.Place = rows;
        });
    }

    // Metodo que calcula la forma de mostrar los horarios en la grilla
    function GetHour(hourToShow, currentHour) {

        if (hourToShow > 12) { hourToShow = hourToShow - 12; }
        var time = null, ampm = " am";

        if (currentHour >= 12 && currentHour <= 23 || currentHour == 11 && hourToShow == 12) { ampm = " pm"; }

        time = hourToShow + ":" + $scope.FormatHour + ampm;

        return time;
    }

    // Limpiar modal
    function ClearInputModal() {
        $scope.reserva = "";
        $scope.hora = "";
        $scope.valor = "";
        $scope.nombre = "";
        $scope.celular = "";
        $scope.Cancha = "";
        $scope.statusActual = "";
    };

    function ClearDataModarReserva() {
        $scope.nameUserOffline = "";
        $scope.idUser = "";
        $scope.hourReserva = "";
        $scope.userType = "";
        $scope.canchaReserva = "";
        $scope.numeroCelularReserva = "";
        $scope.priceReserva = "";
        $scope.emailReserva = "";
        $scope.observacionesReserva = "";
        $scope.$broadcast('angucomplete-alt:clearInput');
        $scope.disableInput = false;
    }

    function ShowNotificationUsersApp(id_place, fecha) {

        PNotify.removeAll();
        reservationService.getUserAppReservation(id_place, fecha).then(function (result) {
            if (result.status != 200) {
                $scope.message = "Upps! Lo siento, creo que tenemos un error al consultar las canchas ocupadas.";
                console.log(result);
            }
            else {
                if (result.data.length > 0) {

                    $.each(result.data, function (index, item) {

                        var cancha = item.id_pitch;
                        var descriptionCancha = item.name;
                        var dateReservation = item.date;

                        // Consultar datos detallados de la reserva
                        reservationService.getDetail(item.id_reservation).then(function (result) {
                            if (result.status != 200) {
                                $scope.message = "Upps! Lo siento, creo que tenemos un error al consultar detalle de la reserva.";
                                console.log(result);
                            }
                            else {

                                $.each(result.data, function (index, item) {

                                    $scope.reservaUsersApp = item.id_reservation;
                                    $scope.horaUsersApp = GetHour(item.hour.split(":")[0], item.hour.split(":")[0]);
                                    $scope.valorUsersApp = item.value;
                                    $scope.nombreUsersApp = item.name;
                                    $scope.celularUsersApp = item.phone;
                                    $scope.CanchaUsersApp = item.description;
                                    // <br><br> <button class='btn-success btn-sm'>Ver Reserva</button>

                                    new PNotify({
                                        text: "<strong>" + item.name + "</strong> acaba de realizar una reserva. <strong>Hora:</strong> " + GetHour(item.hour.split(":")[0], item.hour.split(":")[0]) + ", <strong>Cancha:</strong> " + descriptionCancha + ", <strong>Fecha: </strong>" + dateReservation.substring(0, 10),
                                        hide: false,
                                        icon: 'glyphicon glyphicon-envelope',
                                        styling: "bootstrap3",
                                        type: 'info',
                                        after_init: function (notice) {
                                            notice.elem.on('click', 'button', function () {

                                            });
                                        }
                                    })

                                });
                            }

                        }, function (error) {
                            if (error.status == 401) { authService.logOut(); $location.path('/login'); }
                        });
                    });
                }
            }
        }, function (error) {
            if (error.status == 401) { authService.logOut(); $location.path('/login'); }
        });
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

        }, function (error) {
            if (error.status == 401) { authService.logOut(); $location.path('/login'); }
        });
    }

    function getNameUserReservations(id_reservation) {
        var nameUserResevation = "";
        reservationService.getDetailGrid(id_reservation).then(function (result) {
            return nameUserResevation = result[0].name;
        });
    }

}])
