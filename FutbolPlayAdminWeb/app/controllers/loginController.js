'use strict';
app.controller('loginController', ['$scope', '$location', 'authService', function ($scope, $location, authService) {

    $scope.loginData = {
        userName: "",
        password: ""
    };

    $scope.message = "";
    $scope.messageOk = "";

    if (!authService.authentication.isAuth) {
        
        $scope.login = function () {
            $("#loginbtn").hide();
            $scope.$emit('LOAD');
            authService.login($scope.loginData).then(function (response) {

                $scope.$emit('UNLOAD');
                $location.path('/home');                
            },
             function (error) {
                 $("#loginbtn").prop('disabled', false);
                 if (error !== null && error.error_description) {
                     $scope.message = error.error_description;
                 }
                 else {
                     $scope.message = "Ups!!! Parece que Arnoldo esta haciendo de las suyas. Espera mientras reestablecemos la conexion.";
                 }
                 $scope.$emit('UNLOAD');
                 $("#loginbtn").show();
             });
        };
    }
    else {
        $location.path('/home');
    }

    // Oculatamos el boton volver
    $("#back").hide();

    $scope.forgotpassword = function () {
        var email = $scope.loginData.userName;
        // Validamos que el cliente si haya ingresado su correo electrnico
        if (email == "" || typeof email === 'undefined' || email == " ") {
            $scope.message = "Upsss!!! Debes ingresar tu correo electronico para recuperar tu contraseña.";
        }
        else {
            $scope.message = "";
            $("#loginbtn").hide();
            $scope.$emit('LOAD');
            // Llamamos a la API para recuperar el correo electornico
            authService.forgotpassword(email).then(function (response) {

                $scope.$emit('UNLOAD');
                $("#back").show();
                $scope.messageOk = "Listo! Arnoldo acaba de enviarte un correo electronico con tu nueva contraseña!";
            }, function (error) {
                $scope.$emit('UNLOAD');
                if (error !== null && error.data.Message) {
                    $("#loginbtn").show();
                    $scope.message = "Tu correo parece no estar registrado en Futbol Play, intenta de nuevo.";
                }
                else {
                    $scope.message = "Ups!!! Parece que Arnoldo esta haciendo de las suyas. Espera mientras reestablecemos la conexion.";
                }
            });
        }
    }

}])