(function () {
    var thisModule = angular.module('pipSampleMaps');

    thisModule.controller('pipMapsDottracesSamplesController',
        function ($scope, $interval, $timeout, pipMapHelperSrv) {
            $scope.options = {
                center: {
                    latitude: 44,
                    longitude: -108
                },
                zoom: 17,
                events: {
                    'zoom_changed': (event) => { console.log('zoom_changed', event); }
                }
            };

            const personIcon = {
                path: 'M256 469c-118 0-213-95-213-213 0-118 95-213 213-213 118 0 213 95 213 213 0 118-95 213-213 213z m0-64c35 0 64-28 64-64 0-35-29-64-64-64-35 0-64 29-64 64 0 36 29 64 64 64z m0-303c-53 0-100 28-128 69 1 42 85 66 128 66 43 0 127-24 128-66-28-41-75-69-128-69z',
                fillColor: '#2196F3',
                fillOpacity: .9,
                scale: 0.11,
                rotation: 180
            };

            $scope.positions = [{
                id: 0,
                coords: {
                    latitude: 44,
                    longitude: -108
                },
                icon: personIcon
            }];

            $scope.traceIndex = 0;

            $scope.traces = [
                {url: 'https://raw.githubusercontent.com/pip-webui/pip-webui-locations/master/samples/images/traces/trace1.kml'},
                {url: 'https://raw.githubusercontent.com/pip-webui/pip-webui-locations/master/samples/images/traces/trace2.kml'},
                {url: 'https://raw.githubusercontent.com/pip-webui/pip-webui-locations/master/samples/images/traces/trace3.kml'},
               // {url: 'https://raw.githubusercontent.com/pip-webui/pip-webui-locations/master/samples/images/traces/trace4.kml'}
            ];

            $scope.stepBack = () => {
                if ($scope.traceIndex > 0) $scope.traceIndex--;
                $scope.dotTrace[0] = $scope.traces[$scope.traceIndex];
            }

            $scope.toStep = (index) => {
                if (index >= 0 && index < $scope.traces.length) $scope.traceIndex = index;
                $scope.dotTrace[0] = $scope.traces[$scope.traceIndex];
            }

            $scope.stepForward = () => {
                if ($scope.traceIndex < $scope.traces.length - 1) $scope.traceIndex++;
                $scope.dotTrace[0] = $scope.traces[$scope.traceIndex];
            }

            const truckIcon = {
                url: 'images/haul_truck.png',
                size: new google.maps.Size(82, 82),
                origin: new google.maps.Point(0, 0),
                iconBaseSize: 82
            }

            $scope.baseObjects = [{
                url: 'https://raw.githubusercontent.com/pip-webui/pip-webui-locations/master/samples/images/testKml.kml'
            }];

            $scope.dotTrace = [];
            $scope.dotTrace.push($scope.traces[0]);

            $scope.baseObjectsOptions1 = {};
        }
    );
})();