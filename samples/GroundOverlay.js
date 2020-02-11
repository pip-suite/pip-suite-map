(function () {
    var thisModule = angular.module('pipSampleMaps');

    thisModule.controller('pipMapsGroundOverlaySamplesController',
        function ($scope, $interval, $timeout, pipMapHelperSrv) {
            $scope.options = {
                center: {
                    latitude: 37.65,
                    longitude: 14.7
                },
                zoom: 10
            };

            $scope.overlay = [{
                url: 'https://raw.githubusercontent.com/pip-webui/pip-webui-locations/master/samples/images/ground_overlay/overlay.kml'
            }];

            $scope.overlayOptions = {};

            $scope.baseObjects = [{
                url: 'https://raw.githubusercontent.com/pip-webui/pip-webui-locations/master/samples/images/testKml.kml'
            }];

            $scope.baseObjectsOptions1 = {};
        }
    );
})();