'use strict';
app.controller('userController', ['$scope', 'userService', 'localStorageService', 'NgTableParams', '$filter', function ($scope, userService, localStorageService, NgTableParams, $filter) {

    $scope.listUsers = [];
    $scope.idUser;
    $scope.idPlace;
    $scope.filteredUsers = [];
    $scope.currentPage = 1;
    $scope.numPerPage = 5;
    $scope.maxSize = 4;
    $scope.users = [];
    var authData = localStorageService.get('userCustomerData');

    // Se carga la primera vez el listado de usuarios cuando se inicializa el controlador
    $scope.loadUsers = function () {
        userService.getUserByPlace(authData.id_place).then(function (result) {
            if (result.status != 200) {
                $scope.message = "Upps! Lo siento, creo que tenemos un error al consultar los usuarios.";
                console.log(result);
            } else {
                var self = this;
                $scope.tableParams = new NgTableParams({ count: 25 }, { counts: [50, 100, 200], dataset: result.data });
                $.each(result.data, function (index, item) {                    
                    var user = { Nombre: $.trim(item.name), Telefono: $.trim(item.phone), Correo: $.trim(item.email) };
                    $scope.users.push(user);
                });
            }
        }, function (error) {
            if (error.status == 401) { authService.logOut(); $location.path('/login'); }
        });
    }
    $scope.loadUsers();

    // Funcion que se ejecuta cuando se da clic en el boton editar
    $scope.editUser = function (id_user, id_place) {
        $("#saveChangeStatus").prop("disabled", false);
        $scope.idUser = id_user;
        $scope.idPlace = id_place;
        $("#viewDetailUser").modal("show");
        userService.getUserInfo(id_user).then(function (result) {
            if (result.status != 200) {
                $scope.message = "Upps! Lo siento, creo que tenemos un error al consultar los usuarios.";
                console.log(result);
            } else {
                $scope.updateUserName = result.data.name.trim();
                $scope.updateUserMobile = Number(result.data.phone);
                $scope.updateUserEmail = result.data.email;
            }
        }, function (error) {
            if (error.status == 401) { authService.logOut(); $location.path('/login'); }
        });
    }

    // Funcion que se ejecuta cuando se da clic en el boton guardar el modal
    $scope.saveUpdateUser = function () {
        $("#saveChangeStatus").prop("disabled", true);
        $scope.updateUserName;
        $scope.updateUserMobile;
        $scope.updateUserEmail;
        $scope.idUser;
        $scope.idPlace;
        userService.updateUser($scope.idUser, $scope.idUser, $scope.updateUserName, $scope.updateUserMobile, $scope.updateUserEmail, $scope.idPlace).then(function (result) {
            if (result.status != 204) {
                $scope.message = "Upps! Lo siento, creo que tenemos un error al consultar los usuarios.";
                console.log(result);
            } else {
                $scope.loadUsers();
                $('#viewDetailUser').modal('toggle');
                alert("Los datos de '" + $scope.updateUserName + "' fueron actualizados correctamente.");
            }
        }, function (error) {
            if (error.status == 401) { authService.logOut(); $location.path('/login'); }
        });
    }

}]);