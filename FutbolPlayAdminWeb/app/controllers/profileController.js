'use strict';
app.controller('profileController', ['$scope', 'profileService', 'authService', function ($scope, profileService, authService) {

    $scope.updatedata = {
        name: "",
        email: ""
    };

    $scope.message = "";

    if (!$scope.authentication.isAuth)
    { $("#Menu").hide; $location.path('/login'); }
    else {
        // Funcion para actualizar los datos
        $scope.update = function () {

            if ($scope.updatedata.email == "" || typeof $scope.updatedata.email === 'undefined') {
                $scope.message = "Upsss!!! Debes ingresar tu coreo de acceso.";
            } else if ($scope.updatedata.name == "" || typeof $scope.updatedata.name === 'undefined') {
                $scope.message = "Upsss!!! Debes ingresar tu nombre.";
            }
            else {
                $scope.message = "";
                saveData($scope.updatedata);
            }
        }

        // Se ejecuta una vez, para consultar los datos del usuario
        profileService.findUser().then(function (response) {
            $scope.updatedata.email = response.data.email;
            $scope.updatedata.name = response.data.full_name;

        }, function (error) {
            console.log(error);
            $scope.message = "Ups!!! Parece que Arnoldo esta haciendo de las suyas. Espera mientras reestablecemos la conexion."
        });

        function saveData(dataUser) {
            $("#updateData").hide();
            $scope.$emit('LOAD');
            profileService.updateUser(dataUser).then(function (response) {
                $scope.$emit('UNLOAD');
                $("#updateData").show();
                $scope.message = "Arnoldo acaba de tomar nota de tus nuevos datos.";
            }, function (error) {
                //console.log(error);
                $scope.$emit('UNLOAD');
                $("#updateData").show();
                $scope.message = "Ups!!! Parece que Arnoldo esta haciendo de las suyas. Espera mientras reestablecemos la conexion."
            });
        }
    }

}]);