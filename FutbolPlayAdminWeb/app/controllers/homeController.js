'use strict';
app.controller('homeController', ['$scope', '$route', '$location', 'authService', 'reportsService', 'localStorageService', '$window', function ($scope, $route, $location, authService, reportsService, localStorageService, $window) {

    var authData = localStorageService.get('userCustomerData');

    // Seteo de las fechas actuales
    var d = new Date();
    moment.locale('es');
    var currentYeard = moment(d).format("YYYY");
    var currentMonth = moment(d).format("MM");
    $scope.Month = moment(d).format("MMMM");
    $scope.Year = currentYeard

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
    $scope.scrollTo = function (id) {
        // set the location.hash to the id of
        // the element you wish to scroll to.
        $location.hash(id);
        // call $anchorScroll()
        $anchorScroll();
    };
    $scope.logOut = function () {
        $("#Menu").hide;
        authService.logOut();
        $location.path('/login');
    }

    $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales", "Tele Sales", "Corporate Sales"];
    $scope.datachart = [300, 500, 100, 40, 120];
    $scope.labels1 = ["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"];

    $scope.datachart1 = [
      [65, 59, 90, 81, 56, 55, 40],
      [28, 48, 40, 19, 96, 27, 100]
    ];


    $scope.authentication = authService.authentication;

    if (!$scope.authentication.isAuth) {
        $("#Menu").hide; $location.path('/login');
    }
    else {
        $("#Menu").show;

        // Se carga la primera vez el listado de usuarios cuando se inicializa el controlador
        $scope.loadData = function () {
            reportsService.getDataReport(authData.id_place).then(function (result) {
                if (result.status != 200) {
                    $scope.message = "Upps! Lo siento, creo que tenemos un error al consultar los usuarios.";
                    console.log(result);
                } else {
                    var self = this;

                    // Reporte de Cantidad por Estado del Mes Actual - PASTEL
                    $scope.estados = [];
                    $scope.cantidades = [];

                    $.each(result.data, function (index, item) {
                        if (item.year == currentYeard && item.month == currentMonth) {
                            $scope.estados.push(item.status);
                            $scope.cantidades.push(item.cantidad);
                        }
                    });

                    $scope.EstadoReserva = $scope.estados;
                    $scope.CantidadEstadoReserva = $scope.cantidades;

                    // Reporte de Cantidad de Reservas de los ultimos 3 meses - BARRAS

                    $scope.labels3 = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
                    $scope.series3 = ['Series A', 'Series B'];
                    $scope.data3 = [
                      [65, 59, 80, 81, 56, 55, 40],
                      [28, 48, 40, 19, 86, 27, 90]
                    ];

                    $scope.estadosBarra = [];
                    $scope.ingresosBarra = [];
                    $scope.mesesBarra = [];
                    var tempCurrentYeard = currentYeard - 2
                    var tempCurrentMonth = currentMonth - 3

                    $.each(result.data, function (index, item) {
                        if (item.year == currentYeard && item.month == currentMonth) {
                            $scope.estadosBarra.push(item.status);
                            $scope.ingresosBarra.push(item.ingresos);
                            $scope.mesesBarra.push(item.month);
                        }
                    });
                    //console.log($scope.EstadoReservaBarra);
                    //console.log($scope.CantidadEstadoReservaBarra);
                    //console.log($scope.MesesBarra);

                    $scope.EstadoReservaBarra = $scope.estadosBarra;
                    $scope.IngresosReservaBarra = $scope.ingresosBarra;
                    $scope.MesesBarra = $scope.mesesBarra;
                }
            }, function (error) {
                if (error.status == 401) { authService.logOut(); $location.path('/login'); }
            });
        }

        $scope.loadData();
    }

    $scope.$on('LOAD', function () { $scope.loading = true });
    $scope.$on('UNLOAD', function () { $scope.loading = false });

    function isInArray(value, array) {
        return array.indexOf(value) > -1;
    }

}]);