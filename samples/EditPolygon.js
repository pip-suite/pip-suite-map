(function () {
        var thisModule = angular.module('pipSampleMaps');

        thisModule.controller('pipMapsEditPolygonSamplesController',
            function ($scope, $interval, $timeout, uiGmapGoogleMapApi) {
                $scope.mapOptions = {
                    zoom: 16,
                    center: {
                        latitude: 44,
                        longitude: -108
                    }
                };

                $scope.circle = {
                    type: 'circle',
                    name: 'Circle',
                    center: {
                        coordinates: [-108, 44]
                    },
                    distance: 200,
                    geometry: {

                    }
                };

                $scope.marker = {
                    type: 'marker',
                    pos: {
                        coordinates: [-108, 44]
                    },

                    geometry: {

                    }
                }

                $scope.polygon = {
                    type: 'line',
                    name: 'Polygon',
                    geometry: {
                        coordinates: [
                            [-108.001, 44.0002],
                            [-108.01, 44.001],
                            [-107.9992, 43.9991]
                        ]
                    }
                };

                $scope.current = 'circle';
                $scope.currentOverlay = $scope.polygon;
                $scope.isDisabled = false;

                $scope.onChangeOverlay = () => {
                    $scope.currentOverlay = $scope.current === 'circle' ? $scope.polygon : $scope.marker;
                    $scope.current = $scope.current === 'circle' ? 'polygon' : 'circle';
                }

                $scope.onEdit = (overlay, type, path, center, radius) => {
                    switch (type) {
                        case 'circle':
                            console.log('latitude', center.lat());
                            console.log('longitude', center.lng());
                            console.log('radius', radius);
                            break;
                        case 'marker':
                            console.log('latitude', center.lat());
                            console.log('longitude', center.lng());
                            break;
                        default:
                            console.log('path', path);
                            break;
                    }
                }

                $scope.actionTypes = ['clear', 'circle'];
                $scope.state = 'clear';

                $scope.setControl = (control) => {
                    $scope.editControl = control;
                }

                $scope.onEditOrClear = () => {
                    if ($scope.state === 'clear') $scope.editControl.clearMap();
                    else {
                        if ($scope.current === 'circle') {
                            $scope.editControl.addMarker();
                        } else {
                            $scope.editControl.addPolygon();
                        }
                    }

                    $scope.state = $scope.state === 'clear' ? 'edit' : 'clear';
                }

                $scope.disable = () => {
                    $scope.isDisabled = !$scope.isDisabled;
                }

                $scope.areas = [{
                    id: 1,
                    title: 'Red Zone',
                    color: '#039BE5',
                    type: 'Place of a group of workers',
                    creator: 'Bill Whithers',
                    path: [{
                            latitude: 44.002194156539915,
                            longitude: -107.99772756881714
                        },
                        {
                            latitude: 44.002888717877760,
                            longitude: -107.99562471694946
                        },
                        {
                            latitude: 44.00345979555278,
                            longitude: -107.99684780426026
                        },
                        {
                            latitude: 44.00293502167786,
                            longitude: -107.99733060188294
                        }
                    ]
                }];

                $scope.areasOptions = {
                    //popup: areasPopup,
                    events: {
                        dblclick: () => {
                            console.log('external dblclick');
                        }
                    }
                };

                $scope.roads = [{
                    id: 1,
                    path: [{
                            latitude: 44,
                            longitude: -108.00005
                        },
                        {
                            latitude: 44.0001,
                            longitude: -107.99996
                        },
                        {
                            latitude: 44.00065,
                            longitude: -107.9994
                        },
                        {
                            latitude: 44.00088,
                            longitude: -107.99906
                        },
                        {
                            latitude: 44.00101,
                            longitude: -107.99908
                        },
                        {
                            latitude: 44.00161,
                            longitude: -107.99858
                        },
                        {
                            latitude: 44.00361,
                            longitude: -107.99688
                        },
                        {
                            latitude: 44.00378391827416,
                            longitude: -107.99666004962921
                        },
                        {
                            latitude: 44.003919933531535,
                            longitude: -107.99606862254143
                        },
                        {
                            latitude: 44.00391511030082,
                            longitude: -107.99553352184296
                        },
                        {
                            latitude: 44.00408681707377,
                            longitude: -107.99535649604798
                        },
                        {
                            latitude: 44.00408681707377,
                            longitude: -107.99535649604798
                        },
                        {
                            latitude: 44.004528622103955,
                            longitude: -107.99528139419556
                        }
                    ]
                }];

                $scope.roadsOptions = {
                    stroke: {
                        color: '#039BE5'
                    }
                };

                $scope.circles = [{
                    id: 1,
                    title: 'Circle',
                    center: {
                        coordinates: [
                            43.99558866479921, -108.00266149230004
                        ],
                        latitude: 43.99558866479921,
                        longitude: -108.00266149230004,
                        //type: 'Point'
                    },
                    distance: 50,
                    stroke: {
                        color: '#03A9F4',
                        weight: 3,
                        opacity: 1
                    },
                    fill: {
                        color: '#03A9F4',
                        opacity: 0.15
                    },
                    geodesic: true
                }];

                $scope.circlesOptions = {
                    radius: 'distance'
                }
            }
        );

    }

)();