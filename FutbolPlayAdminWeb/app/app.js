var countColumn;
var dataColumn;
var busyPitch;
var app = angular.module('FutPlayApp', ['ngRoute', 'LocalStorageModule', 'angular-loading-bar', 'angucomplete-alt', 'ui.bootstrap.datetimepicker', 'ui.dateTimeInput', 'chart.js', 'ngTable', 'ngSanitize', 'ngCsv']);

app.config(function ($routeProvider, $locationProvider) {

    $routeProvider.when("/home/", {
        controller: "homeController",
        templateUrl: "/app/views/home.html"
    });
    $routeProvider.when("/login/", {
        controller: "loginController",
        templateUrl: "/app/views/login.html"
    });
    $routeProvider.when("/password-recovery/", {
        controller: "loginController",
        templateUrl: "/app/views/password-recovery.html"
    });
    $routeProvider.when("/change-password/", {
        controller: "changepasswordController",
        templateUrl: "/app/views/change-password.html"
    });
    $routeProvider.when("/reservation/", {
        controller: "reservationController",
        templateUrl: "/app/views/reservation.html"
    });
    $routeProvider.when("/reservationmultiple/", {
        controller: "reservationmultipleController",
        templateUrl: "/app/views/reservation-multiple.html"
    });
    $routeProvider.when("/scheduler/", {
        controller: "schedulerController",
        templateUrl: "/app/views/scheduler.html"
    });
    $routeProvider.when("/profile/", {
        controller: "profileController",
        templateUrl: "/app/views/profile.html"
    });
    $routeProvider.when("/help/", {
        controller: "helpController",
        templateUrl: "/app/views/help.html"
    });
    $routeProvider.when("/users/", {
        controller: "userController",
        templateUrl: "/app/views/users.html"
    });
    $routeProvider.when("/cancelreservation/", {
        controller: "cancelreservationController",
        templateUrl: "/app/views/cancel-reservation.html"
    });
    $routeProvider.otherwise({ redirectTo: "/login" });
});

app.directive('toNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.push(function (value) {
                return parseFloat(value || '');
            });
        }
    };
});

var serviceAuthSecurity = 'http://localhost:7937/'
var serviceFutbolPlayAPI = 'http://localhost:63955/'

app.constant('servicesConnect', {
    apiAuth: serviceAuthSecurity,
    apiFutbolPlay: serviceFutbolPlayAPI
});

app.config(function ($httpProvider, ChartJsProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
    ChartJsProvider.setOptions({ colors: ['#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'] });
});

app.run(['authService', function (authService) {
    authService.fillAuthData();
}]);

app.run(['$rootScope', function ($root) {
    $root.$on('$routeChangeStart', function (e, curr, prev) {
        if (curr.$$route && curr.$$route.resolve) {
            // Show a loading message until promises aren't resolved
            $root.loadingView = true;
        }
    });
    $root.$on('$routeChangeSuccess', function (e, curr, prev) {
        // Hide loading message
        $root.loadingView = false;
    });
}]);

app.filter('strLimit', ['$filter', function ($filter) {
    return function (input, limit) {
        if (!input) return;
        if (input.length <= limit) {
            return input;
        }
        return $filter('limitTo')(input, limit);
    };
}]);