'use strict';
app.controller('changepasswordController', ['$scope', 'changepasswordService', 'localStorageService', 'authService', function ($scope, changepasswordService, localStorageService, authService) {

    $scope.updatedata = {
        password_old: "",
        password_new: ""
    };

    $scope.message = "";
    $scope.messageOk = "";
    var authData = localStorageService.get('userCustomerData');

    if (!$scope.authentication.isAuth)
    { $("#Menu").hide; $location.path('/login'); }
    else {

        $scope.updatePassword = function () {

            var passNewOne = $scope.updatedata.password_new_one;
            var passNewTwo = $scope.updatedata.password_new_two;
            var passOld = $scope.updatedata.password_old;

            // Validamos que el cliente si haya ingresado su correo electrnico
            if (passNewOne == "" || typeof passNewOne === 'undefined' || passNewOne == " ") {
                $("#message").html("<div class='alert alert-warning'>Upsss!!! Debes ingresar tu contraseña nueva</div>");
            }
            else if (passOld == "" || typeof passOld === 'undefined' || passOld == " ") {
                $("#message").html("<div class='alert alert-warning'>Upsss!!! Debes ingresar tu contraseña actual</div>");
            }
            else if (passNewTwo == "" || typeof passNewTwo === 'undefined' || passNewTwo == " ") {
                $("#message").html("<div class='alert alert-warning'>Upsss!!! Debes confirmar tu contraseña nueva</div>");
            }
            else {

                if (passNewOne == passNewTwo) {

                    $("#message").html("");
                    $("#uppass").hide();
                    $scope.$emit('LOAD');
                    // Llamamos a la API para recuperar el correo electornico
                    changepasswordService.changepassword(passNewOne, passOld, authData.id_place).then(function (response) {
                        $scope.$emit('UNLOAD');
                        $("#uppass").show();
                        $("#message").html("<div class='alert alert-success'>Arnoldo acaba de cambiar tu contraseña exitosamente!</div>");

                        $scope.updatedata.password_new_one = "";
                        $scope.updatedata.password_new_two = "";
                        $scope.updatedata.password_old = "";

                    }, function (error) {
                        //console.log(error);
                        if (error !== null && error.error_description) {
                            $("#message").html("<div class='alert alert-warning'>"+error.error_descriptions+"</div>");
                        }
                        else {
                            $("#message").html("<div class='alert alert-warning'>Ups!!! Parece que ingresaste mal tu contraseña. Intenta de nuevo.</div>");
                        }
                        $scope.$emit('UNLOAD');
                        $("#uppass").show();
                    });
                }
                else {
                    $("#message").html("<div class='alert alert-warning'>Ups!!! Tu contraseña actual no conincide. Intenta nuevamente.</div>");
                }
            }
        }
    }

}]);