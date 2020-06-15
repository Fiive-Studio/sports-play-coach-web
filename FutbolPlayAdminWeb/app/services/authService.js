'use strict';
app.factory('authService', ['$http', '$q', 'localStorageService', 'servicesConnect', function ($http, $q, localStorageService, servicesConnect) {

    var serviceBase = servicesConnect.apiAuth;
    var serviceBaseOther = servicesConnect.apiFutbolPlay;
    var authServiceFactory = {};

    var _authentication = {
        isAuth: false,
        userName: "",
        idUsers: "",
    };

    var _login = function (loginData) {
        var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password + "&client_id=cdb59355f3ba293977fc0945fb85aiop";
        var deferred = $q.defer();
        $http.post(serviceBase + 'oauth2/token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

            localStorageService.set('authorizationData', { token: response.access_token, userName: loginData.userName });
            localStorageService.set('userCustomerData', { iduser: response.id_user, id_place: response.id_place, name_customer: response.name_customer });

            _authentication.isAuth = true;
            _authentication.userName = loginData.userName;
            _authentication.idUsers = response.id_user;

            deferred.resolve(response);

        }).error(function (err, status) {
            _logOut();
            deferred.reject(err);
        });
        return deferred.promise;
    };

    var _logOut = function () {
        localStorageService.remove('authorizationData');
        _authentication.isAuth = false;
        _authentication.userName = "";
        _authentication.idUsers = "";
    };

    var _fillAuthData = function () {
        var authData = localStorageService.get('authorizationData');
        if (authData) {
            _authentication.isAuth = true;
            _authentication.userName = authData.userName;
        }
    };

    var _forgotpassword = function (email) {
        var data = "email=" + email;
        var deferred = $q.defer();
        $http.post(serviceBaseOther + 'api/customers/forgotpassword', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function (results) {
            deferred.resolve(results);
        }, function errorCallback(err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    authServiceFactory.login = _login;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.fillAuthData = _fillAuthData;
    authServiceFactory.authentication = _authentication;
    authServiceFactory.forgotpassword = _forgotpassword;

    return authServiceFactory;
}]);