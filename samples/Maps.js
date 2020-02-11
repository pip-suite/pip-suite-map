(function () {
    var thisModule = angular.module('pipSampleMaps', []);

    thisModule.controller('pipMapsSamplesController',
        function ($scope, $interval, $timeout, pipMapHelperSrv) {
            $scope.options = {
                center: {
                    latitude: 44,
                    longitude: -108
                },
                zoom: 16,
                events: {
                    'click': () => {
                        console.log('click this map!');
                    }
                },
                control: {}
            };

            $scope.center = [{
                latitude: 44,
                longitude: -108,
                id: 0
            }];

            $scope.centerOptions = {
                icon: 'icon'
            };

            $timeout(() => {
                console.log('$scope.options', $scope.options);
            }, 1000);

            //console.log('pipMapHelperSrv.getDirectionByAngle(90)', pipMapHelperSrv.getDirectionByAngle(90));

            const personIcon = {
                path: 'M256 469c-118 0-213-95-213-213 0-118 95-213 213-213 118 0 213 95 213 213 0 118-95 213-213 213z m0-64c35 0 64-28 64-64 0-35-29-64-64-64-35 0-64 29-64 64 0 36 29 64 64 64z m0-303c-53 0-100 28-128 69 1 42 85 66 128 66 43 0 127-24 128-66-28-41-75-69-128-69z',
                fillColor: '#2196F3',
                fillOpacity: .9,
                scale: 0.11,
                rotation: 180
            };

            const truckIcon = {
                url: 'images/haul_truck.png',
                size: new google.maps.Size(82, 82),
                origin: new google.maps.Point(0, 0),
                iconBaseSize: 82
            }

            $scope.positions = [{
                    id: 0,
                    latitude: 43.99558866479921,
                    longitude: -108.00266149230004,
                    color: '#2196F3',
                    title: 'Jeff Simons',
                    type: 'person',
                    position: 'Stockman',
                    details: 'Responsible for fuel stored at fuel stations',
                    icon: {
                        path: 0,
                        scale: 3,
                        strokeWeight: 6,
                        fillColor: '#F8E81C',
                        strokeColor: '#F8E81C'
                    }
                },
                /*, {
                                    id: 1,
                                    color: 'grey',
                                    latitude: 43.99919587345425,
                                    longitude: -108.00008254833222,
                                    title: 'Fuel storage point',
                                    creator: 'Bill Whithers',
                                    type: 'building',
                                    details: 'Stored fuel for official vehicles',
                                    icon: 'images/building_map_icon.png'
                                },
                                 {
                                     id: 2,
                                     latitude: 44.000045,
                                     longitude: -107.9995,
                                     title: 'marker 3'
                                 }*/
            ];

            $scope.kml = [{
                url: 'https://raw.githubusercontent.com/pip-webui/pip-webui-locations/master/samples/images/testKml.kml'
            }];

            $scope.kmlOptions = {};

            $scope.positionsOptions = {
                popup: {
                    options: {
                        setPosition: true,
                        events: {
                            click: (options, param) => {
                                options.updatePosition = !options.updatePosition;
                                if (options.updatePosition) {
                                    param.position = {
                                        latitude: $scope.positions[0].latitude,
                                        longitude: $scope.positions[0].longitude
                                    };
                                }
                            }
                        },
                        updatePosition: true
                    },
                    offset: {
                        width: 0,
                        height: 0
                    },
                    templateUrl: './PositionPopup.html'
                }
            };

            $scope.onPopupButtonClick = () => {
                console.log('i am here');
            }

            let areasPopup = {
                options: {
                    setPosition: true
                },
                offset: {
                    width: 0,
                    height: 0
                },
                templateUrl: './AreaPopup.html'
            };

            let roadsPopup = {
                options: {
                    setPosition: true,
                    events: {
                        click: (model) => {
                            console.log('click', model);
                        }
                    }
                },
                offset: {
                    width: 0,
                    height: 0
                },
                templateUrl: './RoadPopup.html'
            };

            $scope.areas = [{
                id: 1,
                color: '#F44336',
                title: 'Place of a group of workers',
                type: 'Place of deployment of a group of workers',
                creator: 'Bill Whithers',
                stroke: {
                    color: '#03A9F4',
                    weight: 9
                },
                fill: {
                    color: '#60E8E1',
                    opacity: 0.1
                },
                path: [{
                        latitude: 43.996888211347496,
                        longitude: -108.00366061515808
                    },
                    {
                        latitude: 43.99691715415376,
                        longitude: -108.00304370708466
                    },
                    {
                        latitude: 43.99641161777432,
                        longitude: -108.00260382480622
                    },
                    {
                        latitude: 43.99691715415376,
                        longitude: -108.00304370708466
                    },
                    {
                        latitude: 43.996888211347496,
                        longitude: -108.00366061515808
                    }
                ]
            }];

            $scope.areasOptions = {
                popup: areasPopup,
                stroke: 'stroke',
                fill: 'fill',
                events: {
                    dblclick: () => {
                        console.log('external dblclick');
                    }
                }
            };

            $scope.areas2 = [{
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

            $scope.areasOptions2 = {
                popup: areasPopup,
                events: {
                    dblclick: () => {
                        console.log('external dblclick');
                    }
                }
            };

            $scope.tempRoads = [{
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

            $scope.roads2 = [{
                id: 1,
                title: 'Road from office to Red Zone',
                type: 'Way to move',
                color: '#F44336',
                creator: 'Steve Kof',
                path: [
                    /*{
                                            latitude: 43.99919587345425,
                                            longitude: -108.00008254833222
                                        },
                                        {
                                            latitude: 43.999099401083505,
                                            longitude: -108.00023811645508
                                        },
                                        {
                                            latitude: 43.99848197419625,
                                            longitude: -108.00046878643036
                                        },
                                        {
                                            latitude: 43.99828130907453,
                                            longitude: -108.00059216804505
                                        },
                                        {
                                            latitude: 43.9979918870306,
                                            longitude: -108.00069945640564
                                        },
                                        {
                                            latitude: 43.9977101815521,
                                            longitude: -108.00119298286438
                                        },
                                        {
                                            latitude: 43.997522055573384,
                                            longitude: -108.00128283686638
                                        },
                                        {
                                            latitude: 43.99737541337119,
                                            longitude: -108.00156178660393
                                        },
                                        {
                                            latitude: 43.99661132445383,
                                            longitude: -108.00191047377587
                                        },
                                        {
                                            latitude: 43.99599773077601,
                                            longitude: -108.00199630446434
                                        },
                                        {
                                            latitude: 43.99558866479921,
                                            longitude: -108.00266149230004
                                        }*/
                ],
                stroke: {
                    color: '#F8E81C',
                    weight: 9
                }
            }];

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
                radius: 'distance',
                popup: roadsPopup
            }

            $scope.roadsOptions = {
                stroke: {
                    color: '#039BE5'
                },
                popup: roadsPopup
            };

            $scope.roadsOptions2 = {
                popup: roadsPopup,
                stroke: 'stroke',
                icons: true,
                static: true
            };

            $scope.roads = [{
                id: 1,
                title: 'Employee path',
                type: 'Traffic control of an employee',
                details: 'Step-by-step control of employee movement: Jeff Simons',
                color: '#039BE5',
                creator: 'Jeff Simons',
                path: []
            }];

            let i = 0;
            angular.extend($scope.positions[0], $scope.tempRoads[0].path[0]);
            $interval(() => {
                if ($scope.tempRoads[0].path.length - 1 === i) {
                    i = 0;
                    $scope.roads[0].path = [];
                } else {
                    i++;
                    truckIcon.origin = pipMapHelperSrv.getIconOriginByDirection($scope.tempRoads[0].path[i - 1], $scope.tempRoads[0].path[i]);
                }

                /*_.each($scope.positions, (position) => {
                    let oldPos = {
                        lat: _.clone(position.latitude),
                        lng: _.clone(position.longitude)
                    };

                    position.latitude += getRandom(-latStep, latStep);
                    position.longitude += getRandom(-lngStep, lngStep);
                    position.icon.origin = pipMapHelperSrv.getIconOriginByDirection(oldPos, {
                        lat: position.latitude,
                        lng: position.longitude
                    })
                });*/

                // $scope.roads[0].path.push($scope.tempRoads[0].path[i]);
                // angular.extend($scope.positions[0], $scope.tempRoads[0].path[i]);

                // $scope.options.center = $scope.tempRoads[0].path[i];
            }, 3000);

            const objectTemplate = {
                color: '#2196F3',
                title: 'Jeff Simons',
                type: 'person',
                position: 'Stockman',
                details: 'Responsible for fuel stored at fuel stations'
            };

            const latStep = 0.00025;
            const lngStep = 0.00025;

            function getRandom(min, max) {
                return Math.random() * (max - min) + min;
            }

            const randomGeoPos = () => {
                return {
                    latitude: getRandom(43.90103967578317, 44.008983662585884),
                    longitude: getRandom(-108.1750248670578, -107.99057471752167)
                }
            }

            for (let i = 0; i < 10; i++) {
                const newObj = _.clone(objectTemplate);
                newObj.id = '100' + i;
                angular.extend(newObj, randomGeoPos(), {
                    icon: _.clone(truckIcon)
                });

                $scope.positions.push(newObj);
                $scope.roads2[0].path.push({
                    latitude: newObj.latitude,
                    longitude: newObj.longitude
                });
            }

            $timeout(() => {
                $scope.roads2[0].path = [];
                for (let i = 0; i < 20; i++) {
                    $scope.roads2[0].path.push({
                        latitude: $scope.positions[i].latitude,
                        longitude: $scope.positions[i].longitude
                    });
                }
            }, 60000);

        }
    );
})();