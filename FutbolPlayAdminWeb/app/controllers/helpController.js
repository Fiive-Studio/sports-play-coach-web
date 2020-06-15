'use strict';
app.controller('helpController', ['$scope', '$location', 'authService', '$anchorScroll', function ($scope, $location, authService, $anchorScroll) {



    $scope.authentication = authService.authentication;

    if (!$scope.authentication.isAuth)
    { $("#Menu").hide; }
    else
    { $("#Menu").show; }

    $scope.scrollTo = function (id) {
        $location.hash(id);
        $anchorScroll();
    }

}]);

