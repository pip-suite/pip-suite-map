(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).maps = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function () {
    'use strict';
    function GoogleMapsProvider() {
        var mapOptions = {
            mapTypeId: google.maps.MapTypeId.SATELLITE,
            disableDefaultUI: true,
            panControl: false,
            zoomControl: false
        };
        this.mapOptions = function (options) {
            mapOptions = _.defaults({}, options, mapOptions);
            return _.cloneDeep(mapOptions);
        };
        this.$get = ['$rootScope', function ($rootScope) {
            return {
                mapOptions: function () {
                    return _.cloneDeep(mapOptions);
                },
                map: function (options, geoRegion, onMapClickCallback) {
                    options || (options = {});
                    var onTilesLoaded = _.once(function (map) {
                        google.maps.event.trigger(map, 'resize');
                    });
                    var boundary = geoRegion && geoRegion.boundary || {};
                    return {
                        center: {
                            latitude: (boundary.nw_lat + boundary.se_lat) / 2 || 0,
                            longitude: (boundary.nw_lon + boundary.se_lon) / 2 || 0
                        },
                        zoom: 16,
                        control: {},
                        options: _.assign({}, options, mapOptions),
                        bounds: {},
                        events: {
                            click: onMapClickCallback || function () { },
                            tilesloaded: onTilesLoaded,
                            zoom_changed: onZoomChanged
                        }
                    };
                    function onZoomChanged(map) {
                        var directiveSpecificMaxZoomLevel = options.maxZoomLevel, directiveSpecificMinZoomLevel = options.minZoomLevel, maxZoomLevel = directiveSpecificMaxZoomLevel == null ? mapOptions['maxZoom'] : directiveSpecificMaxZoomLevel, minZoomLevel = directiveSpecificMinZoomLevel == null ? mapOptions['minZoom'] : directiveSpecificMinZoomLevel, currentZoomLevel = map.getZoom();
                        if (currentZoomLevel > maxZoomLevel) {
                            map.setZoom(maxZoomLevel);
                        }
                        else if (currentZoomLevel < minZoomLevel) {
                            map.setZoom(minZoomLevel);
                        }
                    }
                },
                infoWindow: function (additionalClass, offset) {
                    return {
                        show: false,
                        control: {},
                        options: {
                            boxClass: 'pip-map-info-window ' + additionalClass,
                            closeBoxURL: '',
                            pixelOffset: offset || new google.maps.Size(-175, -210, 'px', 'px')
                        }
                    };
                },
                setMapBounds: function (map, geoRegion) {
                    var unwatchBoundsChange = $rootScope.$watch(function () {
                        return map.bounds;
                    }, function (newVal) {
                        if (newVal.northeast && newVal.southwest) {
                            map.bounds = {
                                northeast: {
                                    latitude: geoRegion.boundary.nw_lat,
                                    longitude: geoRegion.boundary.se_lon
                                },
                                southwest: {
                                    latitude: geoRegion.boundary.se_lat,
                                    longitude: geoRegion.boundary.nw_lon
                                }
                            };
                            unwatchBoundsChange();
                        }
                    }, true);
                },
                fitMapToBounds: function (map, bounds) {
                    if (!bounds.isEmpty()) {
                        var currentMapBounds = map.getBounds();
                        if (_.isEmpty(currentMapBounds)
                            || (!_.isEmpty(currentMapBounds)
                                && currentMapBounds.contains
                                && (!currentMapBounds.contains(bounds.getNorthEast())
                                    || !currentMapBounds.contains(bounds.getSouthWest())))) {
                            map.fitBounds(bounds);
                        }
                    }
                }
            };
        }];
    }
    angular
        .module('pipMaps')
        .provider('pipGoogleMaps', GoogleMapsProvider);
})();
},{}],2:[function(require,module,exports){
(function () {
    'use strict';
    uiGmapModelKeyDecorator.$inject = ['$delegate'];
    function uiGmapModelKeyDecorator($delegate) {
        var setChildScope = $delegate.prototype.setChildScope;
        $delegate.prototype.setChildScope = function (keys, childScope) {
            var result = setChildScope.apply(this, arguments);
            if (childScope && childScope.hasOwnProperty('model') && !childScope.model) {
                delete childScope.model;
            }
            return result;
        };
        return $delegate;
    }
    function pipMapHelperSrv() {
        var defaultIconParameters = {
            iconBaseSize: 96,
            iconNormalScaleFactor: 0.5,
            iconActiveScaleFactor: 1,
            iconsPerSprite: 1
        };
        var directions = [{
                name: 'North',
                numberInSprite: 0,
                scope: [-22.5, 22.5]
            },
            {
                name: 'Northeast',
                numberInSprite: 1,
                scope: [22.5, 67.5]
            },
            {
                name: 'East',
                numberInSprite: 2,
                scope: [67.5, 112.5]
            },
            {
                name: 'Southeast',
                numberInSprite: 3,
                scope: [112.5, 157.5]
            },
            {
                name: 'South',
                numberInSprite: 4,
                scope: [157.5, -157.5]
            },
            {
                name: 'SouthWest',
                numberInSprite: 5,
                scope: [-157.5, -112.5]
            },
            {
                name: 'West',
                numberInSprite: 6,
                scope: [-112.5, -67.5]
            },
            {
                name: 'Northwest',
                numberInSprite: 7,
                scope: [-67.5, -22.5]
            },
            {
                name: 'Stop',
                numberInSprite: 8,
                scope: []
            }
        ];
        this.setIconSettings = function (sizes) {
            angular.extend(defaultIconParameters, sizes);
        };
        this.$get = ['uiGmapGoogleMapApi', '$timeout', function (uiGmapGoogleMapApi, $timeout) {
            var service = {
                isReady: false,
                whenReady: uiGmapGoogleMapApi,
                maps: {},
                getIconDimensions: null,
                setIcon: null,
                triggerEvent: null,
                createSize: null,
                createPoint: null,
                createKML: null,
                getCenterFromRegion: null,
                fitMapToRegion: null,
                getBoundsFromRegion: null,
                getBoundsFromCoordinates: null,
                fitMapToBounds: null,
                forceMapToFitBounds: null,
                shouldFitBound: null,
                setModelOptions: null,
                getDegreesBetweenTwoPoints: null,
                getDirection: null,
                getDirectionByAngle: null,
                getIconOriginByDirection: null
            };
            uiGmapGoogleMapApi.then(onInit.bind(service));
            service.getIconDimensions = function (icon, isActive) {
                var parameters = angular.extend({}, defaultIconParameters, icon);
                var scaleFactor = isActive ? parameters.iconActiveScaleFactor : parameters.iconNormalScaleFactor;
                var size = parameters.iconBaseSize * scaleFactor;
                return {
                    origin: this.createPoint(0, size * icon.numberInSprite || 1),
                    anchor: this.createPoint(size / 2, size / 2),
                    size: this.createSize(size, size),
                    scaledSize: this.createSize(size, parameters.iconsPerSprite * size),
                    isActive: isActive
                };
            };
            service.setIcon = function (icon, isActive) {
                isActive = typeof isActive === 'boolean' ? isActive : icon.isActive;
                service.whenReady.then(function () {
                    var iconDimensions = this.getIconDimensions(icon, isActive);
                    _.extend(icon, iconDimensions);
                }.bind(this));
            };
            service.triggerEvent = function () {
                var event = this.maps.event;
                if (!event) {
                    return null;
                }
                return event.trigger.apply(event, arguments);
            };
            service.createSize = function (width, height) {
                var Size = this.maps.Size;
                if (!Size) {
                    return {};
                }
                return new Size(width, height, 'px', 'px');
            };
            service.createPoint = function (x, y) {
                var Point = this.maps.Point;
                if (!Point) {
                    return {};
                }
                return new Point(x, y);
            };
            service.createKML = function (options) {
                var Layer = this.maps.KmlLayer;
                if (!Layer) {
                    return {};
                }
                return new Layer(options);
            };
            service.getCenterFromRegion = function (geoRegion) {
                if (!geoRegion || !geoRegion.boundary) {
                    return {
                        latitude: 0,
                        longitude: 0
                    };
                }
                return {
                    latitude: (geoRegion.boundary.nw_lat + geoRegion.boundary.se_lat) / 2,
                    longitude: (geoRegion.boundary.nw_lon + geoRegion.boundary.se_lon) / 2
                };
            };
            service.fitMapToRegion = function (map, geoRegion) {
                var bounds = this.getBoundsFromRegion(geoRegion);
                $timeout(this.forceMapToFitBounds.bind(this, map, bounds));
            };
            service.getBoundsFromRegion = function (geoRegion) {
                if (!geoRegion || !geoRegion.boundary) {
                    return {};
                }
                return this.getBoundsFromCoordinates([{
                        latitude: geoRegion.boundary.se_lat,
                        longitude: geoRegion.boundary.se_lon
                    },
                    {
                        latitude: geoRegion.boundary.nw_lat,
                        longitude: geoRegion.boundary.nw_lon
                    }
                ]);
            };
            service.getBoundsFromCoordinates = function (coordinates) {
                var LatLngBounds = this.maps.LatLngBounds;
                var LatLng = this.maps.LatLng;
                if (!LatLng || !LatLngBounds) {
                    return {};
                }
                var bounds = new LatLngBounds();
                coordinates.forEach(function (coordinate) {
                    if (!coordinate.latitude || !coordinate.longitude) {
                        return;
                    }
                    bounds.extend(new LatLng(coordinate.latitude, coordinate.longitude));
                });
                return bounds;
            };
            service.fitMapToBounds = function (map, bounds, force) {
                if (bounds.isEmpty()) {
                    return;
                }
                if (force || this.shouldFitBound(map, bounds)) {
                    map.fitBounds(bounds);
                }
            };
            service.forceMapToFitBounds = function (map, bounds) {
                this.fitMapToBounds(map, bounds, true);
            };
            service.shouldFitBound = function (map, bounds) {
                var northEast = bounds.getNorthEast();
                var southWest = bounds.getSouthWest();
                var currentMapBounds = map.getBounds();
                var mapContainsBounds = currentMapBounds.contains &&
                    (!currentMapBounds.contains(northEast) || !currentMapBounds.contains(southWest));
                return _.isEmpty(currentMapBounds) || mapContainsBounds;
            };
            service.setModelOptions = function (pluralModel, options) {
                var plainObject = pluralModel && pluralModel.gObject;
                if (plainObject && angular.isFunction(plainObject.setOptions)) {
                    plainObject.setOptions(options);
                }
            };
            service.getDegreesBetweenTwoPoints = function (point1, point2) {
                var p1 = {
                    lat: function () {
                        return point1.lat || point1.latitude;
                    },
                    lng: function () {
                        return point1.lng || point1.longitude;
                    }
                };
                var p2 = {
                    lat: function () {
                        return point2.lat || point2.latitude;
                    },
                    lng: function () {
                        return point2.lng || point2.longitude;
                    }
                };
                return google.maps.geometry.spherical.computeHeading(p1, p2);
            };
            service.getDirection = function (point1, point2) {
                var degree = this.getDegreesBetweenTwoPoints(point1, point2);
                if ((point1.lat || point1.latitude) === (point2.lat || point2.latitude) &&
                    (point1.lng || point1.longitude) === (point2.lng || point2.longitude)) {
                    return directions[8];
                }
                for (var i = 0; i < 8; i++) {
                    if (degree >= directions[i].scope[0] && degree <= directions[i].scope[1]) {
                        return directions[i];
                    }
                }
                return directions[8];
            };
            service.getDirectionByAngle = function (degree) {
                for (var i = 0; i < 8; i++) {
                    if (degree >= directions[i].scope[0] && degree <= directions[i].scope[1]) {
                        return directions[i];
                    }
                }
                return directions[8];
            };
            service.getIconOriginByDirection = function (point1, point2, iconSize, gutter) {
                if (iconSize === void 0) { iconSize = 82; }
                if (gutter === void 0) { gutter = 15; }
                var direction = this.getDirection(point1, point2);
                return new google.maps.Point(0, direction.numberInSprite * iconSize + direction.numberInSprite * gutter);
            };
            function onInit(maps) {
                var mapTypeId = maps.MapTypeId || {};
                var mapTypes = {
                    roadMap: mapTypeId.ROADMAP,
                    satellite: mapTypeId.SATELLITE,
                    hybrid: mapTypeId.HYBRID,
                    terrain: mapTypeId.TERRAIN
                };
                var symbolPath = maps.SymbolPath || {};
                var symbols = {
                    circle: symbolPath.CIRCLE,
                    backwardClosed: symbolPath.BACKWARD_CLOSED_ARROW,
                    forwardClosed: symbolPath.FORWARD_CLOSED_ARROW,
                    backwardOpened: symbolPath.BACKWARD_OPEN_ARROW,
                    forwardCOpened: symbolPath.FORWARD_OPEN_ARROW
                };
                this.isReady = true;
                angular.extend(this, {
                    mapTypes: mapTypes,
                    symbols: symbols,
                    maps: maps
                });
            }
            return service;
        }];
    }
    angular.module('pipMaps')
        .provider('pipMapHelperSrv', pipMapHelperSrv)
        .decorator('uiGmapModelKey', uiGmapModelKeyDecorator);
})();
},{}],3:[function(require,module,exports){
(function () {
    'use strict';
    MapComponentCtrl.$inject = ['$injector', '$scope', '$element'];
    USGSOverlay.prototype = new google.maps.OverlayView();
    function USGSOverlay(bounds, image, map, opacity) {
        this.bounds_ = bounds;
        this.image_ = image;
        this.map_ = map;
        this.opacity = opacity ? opacity : null;
        this.div_ = null;
        this.setMap(map);
    }
    USGSOverlay.prototype.onAdd = function () {
        var div = document.createElement('div');
        div.style.borderStyle = 'none';
        div.style.borderWidth = '0px';
        div.style.position = 'absolute';
        if (this.opacity)
            div.style.opacity = this.opacity;
        var img = document.createElement('img');
        img.src = this.image_;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.position = 'absolute';
        div.appendChild(img);
        this.div_ = div;
        var panes = this.getPanes();
        panes.overlayLayer.appendChild(div);
    };
    USGSOverlay.prototype.draw = function (bounds) {
        var overlayProjection = this.getProjection();
        if (!overlayProjection)
            return;
        if (bounds) {
            this.bounds_ = bounds;
        }
        var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
        var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
        var div = this.div_;
        if (!div)
            return;
        div.style.left = sw.x + 'px';
        div.style.top = sw.y + 'px';
        div.style.width = (ne.x - sw.x) + 'px';
        div.style.height = (ne.y - sw.y) + 'px';
        if (this.opacity)
            div.style.opacity = this.opacity;
    };
    USGSOverlay.prototype.onRemove = function () {
        if (this.div_ && this.div_.parentNode)
            this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    };
    function MapComponentCtrl($injector, $scope, $element) {
        var _this = this;
        var mapEventHandlerMixinFct = $injector.get('mapEventHandlerMixinFct');
        mapEventHandlerMixinFct.mixTo(this, $scope.$applyAsync.bind($scope));
        this.sidePanel = {};
        this.embededMap = null;
        this.pipMapHelperSrv = $injector.get('pipMapHelperSrv');
        this.uiGmapIsReady = $injector.get('uiGmapIsReady');
        this.$timeout = $injector.get('$timeout');
        this.$rootScope = $injector.get('$rootScope');
        this.MapPopupFct = $injector.get('MapPopupFct');
        this.pipMapHelperSrv.whenReady.then(this.init.bind(this));
        $element.addClass('pip-map flex layout-row');
        $scope.$watch('ctrl.componentOptions.center', function (newVal) {
            if (_this.justResized == true) {
                return;
            }
            if (_this.gMap && newVal) {
                var newCenter = { lat: newVal.latitude || newVal.lat, lng: newVal.longitude || newVal.lng };
                if (_.isNumber(newCenter.lat) && _.isNumber(newCenter.lng)) {
                    _this.gMap.panTo(newCenter);
                }
            }
        }, true);
        $scope.$watch('ctrl.componentOptions.zoom', function (newVal) {
            if (_this.map)
                _this.map.zoom = newVal;
        });
        $scope.$watch('ctrl.componentOptions.embededMap', function (newVal, oldVal) {
            if (newVal && oldVal && newVal.embededSrc && oldVal.embededSrc && newVal.embededSrc == oldVal.embededSrc) {
                if (_this.embededOverlay) {
                    var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(newVal.map_north, newVal.map_west), new google.maps.LatLng(newVal.map_south, newVal.map_east));
                    _this.embededOverlay.draw(bounds);
                    return;
                }
            }
            _this.setEmbededBounds();
        });
        this.$rootScope.$on('pipMainResized', function () {
            _this.throttleResize();
        });
    }
    MapComponentCtrl.prototype.defaultOptions = {
        map: {
            disableDefaultUI: true,
            panControl: false,
            zoomControl: false,
            disableDoubleClickZoom: true
        },
        setInitBounds: false,
        popup: {}
    };
    MapComponentCtrl.prototype.init = function () {
        this.options = angular.merge({
            map: {
                mapTypeId: this.pipMapHelperSrv.mapTypes.satellite
            }
        }, this.defaultOptions, this.componentOptions);
        if (!this.componentOptions.control)
            this.componentOptions.control = {};
        this.map = this.getMap();
        this.map.zoom = this.componentOptions.zoom;
        this.map.center = this.componentOptions.center;
        if (this.options.sidePanel && this.options.sidePanel.templateUrl) {
            this.showSidePanel(this.options.sidePanel.templateUrl);
        }
        this.uiGmapIsReady.promise()
            .finally(this.onMapReady.bind(this));
    };
    MapComponentCtrl.prototype.onMapReady = function () {
        this.setInitBounds();
        this.setEmbededBounds();
    };
    MapComponentCtrl.prototype.setInitBounds = function () {
        var map = this.getMapInstance();
        if (this.options.setInitBounds && map) {
            this.pipMapHelperSrv.fitMapToRegion(map, this.options.geoRegion);
        }
    };
    MapComponentCtrl.prototype.setEmbededBounds = function () {
        var map = this.getMapInstance();
        if (this.componentOptions.embededMap && this.componentOptions.embededMap.embededSrc) {
            var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(this.componentOptions.embededMap.map_north, this.componentOptions.embededMap.map_west), new google.maps.LatLng(this.componentOptions.embededMap.map_south, this.componentOptions.embededMap.map_east));
            var srcImage = this.componentOptions.embededMap.embededSrc;
            this.embededOverlay = new USGSOverlay(bounds, srcImage, map, this.componentOptions.embededMap.opacity);
        }
        else {
            if (this.embededOverlay)
                this.embededOverlay.onRemove();
            this.embededOverlay = null;
        }
    };
    MapComponentCtrl.prototype.getMapInstance = function () {
        if (!this.gMap && this.componentOptions && this.componentOptions.control && this.componentOptions.control.getGMap) {
            this.gMap = this.componentOptions.control.getGMap();
        }
        return this.gMap;
    };
    MapComponentCtrl.prototype.getMap = function () {
        var _this = this;
        var externalClick = this.options.events && this.options.events.click ? this.options.events.click : angular.noop;
        var externalZoom = this.options.events && this.options.events.zoom_changed ? this.options.events.zoom_changed : angular.noop;
        var externalCenter = this.options.events && this.options.events.center_changed ? this.options.events.center_changed : angular.noop;
        var debounceCenterChange = _.debounce(function (event) {
            externalCenter(event);
        }, 500);
        return {
            control: {},
            options: this.options.map,
            bounds: this.options.bounds || {},
            events: _.extend(this.options.events, {
                click: function (event) {
                    _this.onClick(event);
                    externalClick();
                },
                zoom_changed: function (event) {
                    if (event && _this.componentOptions && _this.componentOptions.mapId) {
                        event.mapId = _this.componentOptions.mapId;
                        externalZoom(event);
                    }
                },
                center_changed: function (event) {
                    if (event && _this.componentOptions && _this.componentOptions.mapId) {
                        event.mapId = _this.componentOptions.mapId;
                        debounceCenterChange(event);
                    }
                },
                dblclick: this.onEventHandler.bind(this),
                tilesloaded: this.updateMapTiles.bind(this)
            })
        };
    };
    MapComponentCtrl.prototype.updateMapTiles = function (updateCenter) {
        if (updateCenter === void 0) { updateCenter = false; }
        var gMap = this.getMapInstance();
        if (!gMap)
            return;
        this.pipMapHelperSrv.triggerEvent(gMap, 'resize');
    };
    var throttleUpdatingCenter = _.throttle(function (gMap, center) {
        if (!center)
            return;
        gMap.panTo(center);
        gMap.setCenter(center);
    }, 400);
    MapComponentCtrl.prototype.throttleResize = function () {
        var _this = this;
        var gMap = this.getMapInstance();
        if (!gMap)
            return;
        if (this.justResized != true) {
            this.justResized = true;
            var center = gMap.getCenter();
            this.$timeout(function () {
                throttleUpdatingCenter(gMap, center);
            });
            this.$timeout(function () {
                _this.justResized = false;
            }, 400);
        }
        this.pipMapHelperSrv.triggerEvent(gMap, 'resize');
    };
    MapComponentCtrl.prototype.fitMapToBounds = function (bounds) {
        this.pipMapHelperSrv.fitMapToBounds(this.getMapInstance(), bounds);
    };
    MapComponentCtrl.prototype.showSidePanel = function (template) {
        this.sidePanel.template = template;
        this.sidePanel.show = true;
        this.$timeout(this.updateMapTiles.bind(this));
    };
    MapComponentCtrl.prototype.hideSidePanel = function () {
        this.sidePanel.template = null;
        this.sidePanel.show = false;
        this.$timeout(this.updateMapTiles.bind(this));
    };
    MapComponentCtrl.prototype.onClick = function () {
        this.closePopup();
    };
    MapComponentCtrl.prototype.freeze = function () {
        if (this.isFrozen) {
            return;
        }
        this.setMapOptions({
            draggable: false,
            disableDoubleClickZoom: true,
            scrollwheel: false
        });
        this.isFrozen = true;
    };
    MapComponentCtrl.prototype.unfreeze = function () {
        if (!this.isFrozen) {
            return;
        }
        this.setMapOptions({
            draggable: true,
            disableDoubleClickZoom: true,
            scrollwheel: true
        });
        this.isFrozen = false;
    };
    MapComponentCtrl.prototype.setCursor = function (cursor) {
        this.cursor = cursor;
    };
    MapComponentCtrl.prototype.setMapOptions = function (options) {
        var mapInstance = this.getMapInstance();
        mapInstance.setOptions(options);
    };
    MapComponentCtrl.prototype.createElementPopup = function (options) {
        this.createPopupInstance();
        return this.popup.add(options);
    };
    MapComponentCtrl.prototype.createPopupInstance = function () {
        if (this.popup) {
            return;
        }
        this.popup = this.MapPopupFct.create();
    };
    MapComponentCtrl.prototype.closePopup = function () {
        if (!this.popup) {
            return;
        }
        console.log('this.popup', this.popup);
        this.popup.close();
    };
    function pipMapComponent() {
        return {
            strict: 'AE',
            scope: true,
            transclude: true,
            bindToController: {
                componentOptions: '=pipOptions'
            },
            controller: 'MapComponentCtrl',
            controllerAs: 'ctrl',
            templateUrl: 'map.html'
        };
    }
    angular.module('pipMaps')
        .controller('MapComponentCtrl', MapComponentCtrl)
        .directive('pipMap', pipMapComponent);
})();
},{}],4:[function(require,module,exports){
(function () {
    'use strict';
    function mapEventHandlerMixinFct() {
        var createEventObjFromHandlerArguments = function (gModel, eventName, model, args) {
            if (!args || !args.length) {
                args = model;
                model = null;
            }
            var position = args[0] && args[0].latLng && getPositionFromLatLng(args[0].latLng);
            return {
                gModel: gModel,
                eventName: eventName,
                args: args,
                model: model,
                position: position
            };
        };
        var getPositionFromLatLng = function (latLng) {
            return {
                latitude: latLng.lat(),
                longitude: latLng.lng()
            };
        };
        var mixin = function (postHandler) {
            postHandler = postHandler || angular.noop;
            return {
                addEventHandler: function (eventName, callback) {
                    var handlerName = '__onEventOverridden_' + eventName;
                    this[handlerName] = callback;
                    return function () {
                        this[handlerName] = null;
                    }.bind(this);
                },
                onEventHandler: function (gObject, eventName) {
                    var handlerName = '__onEventOverridden_' + eventName;
                    var eventObj = createEventObjFromHandlerArguments.apply(null, arguments);
                    if (angular.isFunction(this[handlerName])) {
                        this[handlerName](eventObj);
                        postHandler();
                        return;
                    }
                    var defaultHandlerName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
                    if (angular.isFunction(this[defaultHandlerName])) {
                        this[defaultHandlerName](eventObj);
                        postHandler();
                    }
                }
            };
        };
        return {
            mixTo: function (obj, $scope) {
                angular.extend(obj, mixin($scope));
            }
        };
    }
    angular.module('pipMaps')
        .factory('mapEventHandlerMixinFct', mapEventHandlerMixinFct);
})();
},{}],5:[function(require,module,exports){
{
    var config_1 = function (uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyBg6cm-FDBFPWzRcn39AuSHGQSrdtVIjEo',
            v: '3.23',
            libraries: 'geometry'
        });
    };
    config_1.$inject = ['uiGmapGoogleMapApiProvider'];
    angular.module('pipMaps')
        .config(config_1);
}
},{}],6:[function(require,module,exports){
var MapEditBindings = {
    overlay: '<pipOverlay',
    onEdit: '&?pipOnEdit',
    mapOptions: '=?pipMapOptions',
    showActionPanel: '<?pipShowActionPanel',
    actionTypes: '<?pipActionTypes',
    control: '&?pipControl',
    disabled: '<?pipDisabled',
    disabledPolygons: '<?pipDisabledPolygons',
    disabledPolygonsOptions: '<?pipDisabledPolygonsOptions',
    disabledPolylines: '<?pipDisabledPolylines',
    disabledPolylinesOptions: '<?pipDisabledPolylinesOptions',
    disabledCircles: '<?pipDisabledCircles',
    disabledCirclesOptions: '<?pipDisabledCirclesOptions'
};
var actionTypes = (function () {
    function actionTypes() {
    }
    return actionTypes;
}());
actionTypes.clearMap = 'clear';
actionTypes.addCircle = 'circle';
actionTypes.addRectangle = 'rectangle';
actionTypes.addPolygon = 'polygon';
actionTypes.addLine = 'line';
var MapEditChanges = (function () {
    function MapEditChanges() {
    }
    return MapEditChanges;
}());
var MapEditController = (function () {
    MapEditController.$inject = ['$element', '$scope', '$mdConstant', '$document', '$timeout', 'uiGmapGoogleMapApi'];
    function MapEditController($element, $scope, $mdConstant, $document, $timeout, uiGmapGoogleMapApi) {
        var _this = this;
        this.$element = $element;
        this.$scope = $scope;
        this.$mdConstant = $mdConstant;
        this.$document = $document;
        this.$timeout = $timeout;
        this.uiGmapGoogleMapApi = uiGmapGoogleMapApi;
        this.map = {
            control: {},
            options: {
                disableDefaultUI: true,
                mapTypeId: "satellite",
                panControl: false,
                zoomControl: false,
                mapTypeControl: false,
                streetViewControl: false
            }
        };
        this.drawingManagerControl = {};
        this.drawingManagerOptions = {};
        this.currentOverlay = {};
        this._circleOptions = {
            fillColor: '#F8E81C',
            fillOpacity: 0.2,
            strokeWeight: 3,
            strokeColor: '#F8E81C',
            clickable: false,
            editable: !this.disabled,
            zIndex: 1
        };
        this._polygonOptions = {
            fillColor: '#F8E81C',
            fillOpacity: 0.2,
            strokeWeight: 3,
            strokeColor: '#F8E81C',
            clickable: false,
            editable: !this.disabled,
            draggable: !this.disabled,
            zIndex: 1
        };
        this._polylineOptions = {
            strokeWeight: 6,
            strokeColor: '#F8E81C',
            clickable: false,
            editable: !this.disabled,
            zIndex: 1
        };
        this._markerOptions = {
            icon: {
                path: 0,
                scale: 4,
                strokeWeight: 8,
                fillColor: '#F8E81C',
                strokeColor: '#F8E81C',
                strokeOpacity: 0.9,
                draggable: !this.disabled
            }
        };
        this._rectangleOptions = {
            fillColor: '#F8E81C',
            fillOpacity: 0.2,
            strokeWeight: 3,
            strokeColor: '#F8E81C',
            clickable: false,
            editable: !this.disabled,
            draggable: !this.disabled,
            zIndex: 1
        };
        $element.addClass('pip-map-edit');
        uiGmapGoogleMapApi.then(function (maps) {
            _this.drawingManagerOptions = {
                drawingControl: false,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [
                        google.maps.drawing.OverlayType.CIRCLE,
                        google.maps.drawing.OverlayType.POLYGON,
                        google.maps.drawing.OverlayType.POLYLINE
                    ]
                },
                circleOptions: _this._circleOptions,
                polygonOptions: _this._polygonOptions,
                polylineOptions: _this._polylineOptions,
                markerOptions: _this._markerOptions,
                rectangleOptions: _this._rectangleOptions
            };
        });
        $scope.$watch('$ctrl.map.control.getGMap', function () {
            if (_this.currentOverlay && _this.currentOverlay.setMap && _.isFunction(_this.map.control['getGMap'])) {
                _this.currentOverlay.setMap(_this.map.control['getGMap']());
                _this.fitBounds();
            }
        });
        $scope.$watch('$ctrl.mapOptions.embededMap', function () {
            _.assign(_this.map, _this.mapOptions);
        }, true);
        $scope.$watch('$ctrl.mapOptions.isEmbeded', function () {
            _.assign(_this.map, _this.mapOptions);
        });
        $scope.$watch('$ctrl.drawingManagerControl.getDrawingManager', function (val) {
            if (!_this.drawingManagerControl.getDrawingManager) {
                return;
            }
            google.maps.event.addListener(_this.drawingManagerControl.getDrawingManager(), 'overlaycomplete', function (e) {
                _this.drawingManagerControl.getDrawingManager().setDrawingMode(null);
                _this.setOverlay(e.overlay, e.type, false);
                _this.onEditOverlay();
            });
            google.maps.event.addListener(_this.drawingManagerControl.getDrawingManager(), 'drawingmode_changed', function () {
                if (_this.drawingManagerControl.getDrawingManager().getDrawingMode() !== null) {
                    if (_this.currentOverlay && _this.currentOverlay.map)
                        _this.currentOverlay.setMap(null);
                }
            });
            google.maps.event.addDomListener(document, 'keyup', function (e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if (code === 27) {
                    _this.drawingManagerControl.getDrawingManager().setDrawingMode(null);
                }
                if (code === 46) {
                    _this.clearMap();
                }
            });
        });
    }
    MapEditController.prototype.$onDestroy = function () {
    };
    MapEditController.prototype.$onChanges = function (changes) {
        if (changes.overlay && changes.overlay.currentValue) {
            this.setOverlay(this.convertToGoogleMapOverlay(changes.overlay.currentValue), changes.overlay.currentValue.type);
        }
        if (changes.disabled) {
            if (this.currentOverlay) {
                this.currentOverlay.setDraggable(!changes.disabled.currentValue);
                if (this.currentOverlay.setEditable)
                    this.currentOverlay.setEditable(!changes.disabled.currentValue);
            }
        }
    };
    MapEditController.prototype.$onInit = function () {
        angular.extend(this.map, this.mapOptions);
        if (this.control) {
            this.control({ control: this });
        }
    };
    MapEditController.prototype.fitBounds = function () {
        if (!this.map.control['getGMap'] || !this.currentOverlay)
            return;
        switch (this.overlay.type) {
            case 'circle': {
                this.map.control['getGMap']().fitBounds(this.currentOverlay.getBounds());
                break;
            }
            case 'marker': {
                if (this.currentOverlay.getPosition) {
                    this.map.control['getGMap']().panTo(this.currentOverlay.getPosition());
                }
                break;
            }
            case 'rectangle': {
                this.map.control['getGMap']().fitBounds(this.currentOverlay.getBounds());
                break;
            }
            default: {
                if (this.currentOverlay.getPath().getArray().length > 0) {
                    var bounds = new google.maps.LatLngBounds();
                    _.each(this.currentOverlay.getPath().getArray(), function (coor) {
                        bounds.extend(coor);
                    });
                    this.map.control['getGMap']().fitBounds(bounds);
                }
            }
        }
    };
    MapEditController.prototype.convertToGoogleMapOverlay = function (overlay) {
        if (overlay.type === 'polygon') {
            return this.createPolygon(overlay);
        }
        if (overlay.type === 'line' || overlay.type === 'polyline') {
            return this.createPolyline(overlay);
        }
        if (overlay.type === 'circle') {
            return this.createCircle(overlay);
        }
        if (overlay.type === 'marker') {
            return this.createMarker(overlay);
        }
        if (overlay.type === 'rectangle') {
            return this.createRectangle(overlay);
        }
    };
    MapEditController.prototype.createMarker = function (overlay) {
        if ((overlay.pos && overlay.pos.coordinates) || (overlay.latitude && overlay.longitude)) {
            var centerCoords = {};
            centerCoords = {
                lat: overlay.pos.coordinates ? overlay.pos.coordinates[1] : overlay.latitude,
                lng: overlay.pos.coordinates ? overlay.pos.coordinates[0] : overlay.longitude
            };
            var marker = new google.maps.Marker(angular.extend(this.getOptionsByType('marker'), { position: centerCoords }));
            if (this.map.control['getGMap'])
                marker.setMap(this.map.control['getGMap']());
            return marker;
        }
        return new google.maps.Circle(this.getOptionsByType('circle'));
    };
    MapEditController.prototype.createCircle = function (overlay) {
        if (overlay.center && (overlay.center.coordinates || (overlay.center.latitude && overlay.center.longitude)) && overlay.distance) {
            var centerCoords = {};
            centerCoords = {
                lat: overlay.center.coordinates ? overlay.center.coordinates[1] : overlay.center.latitude,
                lng: overlay.center.coordinates ? overlay.center.coordinates[0] : overlay.center.longitude
            };
            var circle = new google.maps.Circle(angular.extend(this.getOptionsByType('circle'), { center: centerCoords, radius: overlay.distance }));
            if (this.map.control['getGMap'])
                circle.setMap(this.map.control['getGMap']());
            return circle;
        }
        return new google.maps.Circle(this.getOptionsByType('circle'));
    };
    MapEditController.prototype.createPolygon = function (overlay) {
        if (overlay.geometry && overlay.geometry.coordinates) {
            var polygonCoords_1 = [];
            _.each(overlay.geometry.coordinates[0], function (coor) {
                polygonCoords_1.push({ lat: coor[1], lng: coor[0] });
            });
            var polygon = new google.maps.Polygon(angular.extend(this.getOptionsByType('polygon'), { paths: polygonCoords_1 }));
            if (this.map.control['getGMap'])
                polygon.setMap(this.map.control['getGMap']());
            return polygon;
        }
        return new google.maps.Polygon(this.getOptionsByType('polygon'));
        ;
    };
    MapEditController.prototype.createPolyline = function (overlay) {
        if (overlay.geometry && overlay.geometry.coordinates) {
            var polylineCoords_1 = [];
            _.each(overlay.geometry.coordinates, function (coor) {
                polylineCoords_1.push({ lat: coor[1], lng: coor[0] });
            });
            var polyline = new google.maps.Polyline(angular.extend(this.getOptionsByType('line'), { path: polylineCoords_1 }));
            if (this.map.control['getGMap'])
                polyline.setMap(this.map.control['getGMap']());
            return polyline;
        }
        return new google.maps.Polyline(this.getOptionsByType('line'));
    };
    MapEditController.prototype.createRectangle = function (overlay) {
        if (overlay.bounds) {
            var rectangleBounds = overlay.bounds;
            var rectangle = new google.maps.Rectangle(angular.extend(this.getOptionsByType('rectangle'), { bounds: rectangleBounds }));
            if (this.map.control['getGMap'])
                rectangle.setMap(this.map.control['getGMap']());
            return rectangle;
        }
        return new google.maps.Rectangle(this.getOptionsByType('rectangle'));
    };
    ;
    MapEditController.prototype.getOptionsByType = function (type) {
        switch (type) {
            case 'polygon':
                return _.cloneDeep(angular.extend(this._polygonOptions, this.getDisableOptions()));
            case 'circle':
                return _.cloneDeep(angular.extend(this._circleOptions, this.getDisableOptions()));
            case 'line':
                return _.cloneDeep(angular.extend(this._polylineOptions, this.getDisableOptions()));
            case 'polyline':
                return _.cloneDeep(angular.extend(this._polylineOptions, this.getDisableOptions()));
            case 'marker':
                return _.cloneDeep(angular.extend(this._markerOptions, this.getDisableOptions()));
            case 'rectangle':
                return _.cloneDeep(angular.extend(this._rectangleOptions, this.getDisableOptions()));
        }
    };
    MapEditController.prototype.getDisableOptions = function () {
        return {
            editable: !this.disabled,
            draggable: !this.disabled
        };
    };
    MapEditController.prototype.setOverlay = function (overlay, type, fitBounds) {
        var _this = this;
        if (fitBounds === void 0) { fitBounds = true; }
        if (!overlay)
            return;
        this.clearMap();
        this.currentOverlay = overlay || {};
        this.currentOverlay.type = type;
        switch (type) {
            case 'circle': {
                this.currentOverlay.center_changed = function () {
                    _this.onEditOverlay();
                };
                this.currentOverlay.radius_changed = function () {
                    _this.onEditOverlay();
                };
                break;
            }
            case 'marker': {
                if (!this.currentOverlay.addListener)
                    return;
                this.currentOverlay.addListener('position_changed', function () {
                    _this.onEditOverlay();
                });
                break;
            }
            case 'rectangle': {
                if (!this.currentOverlay.addListener)
                    return;
                this.currentOverlay.addListener('bounds_changed', function () {
                    _this.onEditOverlay();
                });
                break;
            }
            default: {
                if (!this.currentOverlay.getPath)
                    return;
                google.maps.event.addListener(this.currentOverlay.getPath(), 'set_at', function () {
                    _this.onEditOverlay();
                });
                google.maps.event.addListener(this.currentOverlay.getPath(), 'insert_at', function () {
                    _this.onEditOverlay();
                });
            }
        }
        if (fitBounds)
            this.fitBounds();
    };
    MapEditController.prototype.onEditOverlay = function () {
        if (this.onEdit)
            this.onEdit({
                overlay: this.currentOverlay,
                bounds: this.currentOverlay && this.currentOverlay.type === 'rectangle' ? {
                    north: this.currentOverlay.getBounds().getNorthEast().lat(),
                    east: this.currentOverlay.getBounds().getNorthEast().lng(),
                    south: this.currentOverlay.getBounds().getSouthWest().lat(),
                    west: this.currentOverlay.getBounds().getSouthWest().lng(),
                } : {},
                type: this.currentOverlay ? this.currentOverlay.type : null,
                path: this.currentOverlay && (this.currentOverlay.type === 'polygon' || this.currentOverlay.type === 'polyline') ? this.currentOverlay.getPath() : [],
                center: this.currentOverlay && this.currentOverlay.type === 'circle' ?
                    this.currentOverlay.getCenter() : this.currentOverlay && this.currentOverlay.getPosition && this.currentOverlay.type === 'marker' ? this.currentOverlay.getPosition() : {},
                radius: this.currentOverlay && this.currentOverlay.type === 'circle' ? this.currentOverlay.getRadius() : {}
            });
    };
    MapEditController.prototype.showAction = function (action) {
        return !this.actionTypes ? true : this.actionTypes.includes(action);
    };
    Object.defineProperty(MapEditController.prototype, "showPanel", {
        get: function () {
            return this.showActionPanel === false ? false : true;
        },
        enumerable: true,
        configurable: true
    });
    MapEditController.prototype.addCircle = function () {
        this.drawingManagerOptions.drawingMode = google.maps.drawing.OverlayType.CIRCLE;
    };
    MapEditController.prototype.addPolygon = function () {
        this.drawingManagerOptions.drawingMode = google.maps.drawing.OverlayType.POLYGON;
    };
    MapEditController.prototype.addRectangle = function () {
        this.drawingManagerOptions.drawingMode = google.maps.drawing.OverlayType.RECTANGLE;
    };
    MapEditController.prototype.addLine = function () {
        this.drawingManagerOptions.drawingMode = google.maps.drawing.OverlayType.POLYLINE;
    };
    MapEditController.prototype.addMarker = function () {
        this.drawingManagerOptions.drawingMode = google.maps.drawing.OverlayType.MARKER;
    };
    MapEditController.prototype.clearMap = function () {
        this.drawingManagerOptions.drawingMode = null;
        if (this.currentOverlay && this.currentOverlay.map) {
            this.currentOverlay.setMap(null);
            this.currentOverlay = null;
            this.onEditOverlay();
        }
    };
    return MapEditController;
}());
var config = function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        libraries: 'drawing'
    });
};
config.$inject = ['uiGmapGoogleMapApiProvider'];
(function () {
    angular.module('pipMapsEdit')
        .component('pipMapEdit', {
        bindings: MapEditBindings,
        templateUrl: 'edit/MapEdit.html',
        controller: MapEditController,
        controllerAs: '$ctrl'
    })
        .config(config);
})();
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular.module('pipMapsEdit', []);
require("./MapEdit");
},{"./MapEdit":6}],8:[function(require,module,exports){
(function () {
    'use strict';
    function MapElementsCtrlFct() {
        function MapElementsCtrl($injector, $scope) {
            var mapEventHandlerMixinFct = $injector.get('mapEventHandlerMixinFct');
            mapEventHandlerMixinFct.mixTo(this, $scope.$applyAsync.bind($scope));
            this.control = {};
            this.popUpOpened = null;
            this.pipMapHelperSrv = $injector.get('pipMapHelperSrv');
            this.uiGmapIsReady = $injector.get('uiGmapIsReady');
            this.$q = $injector.get('$q');
        }
        MapElementsCtrl.prototype.$onInit = function () {
            var _this = this;
            this.options = angular.merge({}, this.defaultOptions, this.componentOptions);
            this.models = this.models || [];
            this.externalDblclick = this.options.events && this.options.events.dblclick ? this.options.events.dblclick : angular.noop;
            this.externalClick = this.options.events && this.options.events.click ? this.options.events.click : angular.noop;
            this.externalRightclick = this.options.events && this.options.events.rightclick ? this.options.events.rightclick : angular.noop;
            this.events = _.extend(this.options.events, {
                dblclick: this.onEventHandler.bind(this),
                mousedown: this.onEventHandler.bind(this),
                mouseup: this.onEventHandler.bind(this),
                rightclick: this.onEventHandler.bind(this),
                click: this.onEventHandler.bind(this),
                position_changed: function (objEvent) {
                    _this.updatePopupPosition(objEvent);
                }
            });
        };
        MapElementsCtrl.prototype.$onDestroy = function () {
            this.closePopup();
        };
        MapElementsCtrl.prototype.defaultOptions = {
            popup: false,
            fitBounds: false
        };
        MapElementsCtrl.prototype.init = function (mapCtrl) {
            this.mapCtrl = mapCtrl;
            this.initPopup();
        };
        MapElementsCtrl.prototype.setNewOptions = function (popupOptions) {
            if (this.popup)
                this.popup.setNewOptions(popupOptions);
        };
        MapElementsCtrl.prototype.initPopup = function () {
            if (!this.options.popup) {
                return;
            }
            this.options.popup = angular.merge({}, this.options.popup, {
                onShow: this.onShowPopup.bind(this),
                onClose: this.onClosePopup.bind(this)
            });
            this.pipMapHelperSrv.whenReady.then(function () {
                this.popup = this.mapCtrl.createElementPopup(this.options.popup);
            }.bind(this));
        };
        MapElementsCtrl.prototype.onShowPopup = function () {
            this.popUpOpened = true;
        };
        MapElementsCtrl.prototype.onClosePopup = function () {
            this.popUpOpened = false;
        };
        MapElementsCtrl.prototype.getBoundsToFitAsync = function () {
            if (!this.options.fitBounds) {
                return this.$q.reject('Fit is switched off');
            }
            return this.uiGmapIsReady.promise()
                .then(function () {
                return this.getBounds();
            }.bind(this));
        };
        MapElementsCtrl.prototype.getBounds = function () {
            return this.pipMapHelperSrv.getBoundsFromCoordinates(this.getAllPositions());
        };
        MapElementsCtrl.prototype.getAllPositions = function () {
            if (!angular.isArray(this.models)) {
                return [];
            }
            return this.models.map(function (model) {
                return this.getPosition(model);
            }, this);
        };
        MapElementsCtrl.prototype.getPosition = function (model) {
            return {
                latitude: model.latitude,
                longitude: model.longitude
            };
        };
        MapElementsCtrl.prototype.isModelEmpty = function (model) {
            var position = this.getPosition(model);
            return !position.latitude || !position.longitude;
        };
        MapElementsCtrl.prototype.onDblclick = function (eventObj) {
            this.externalDblclick(eventObj);
        };
        MapElementsCtrl.prototype.onClick = function (eventObj) {
            this.externalClick(eventObj);
            if (this.longClick) {
                this.correctCircleModel(eventObj);
                this.togglePopup(eventObj);
                this.longClick = false;
            }
            else {
                this.closePopup();
            }
        };
        MapElementsCtrl.prototype.correctCircleModel = function (eventObj) {
            var _this = this;
            if (eventObj.gModel.radius && eventObj.gModel.center) {
                var model_1 = {};
                _.each(this.models, function (m) {
                    if (m[_this.options.center] && m[_this.options.radius]) {
                        if (m[_this.options.center].latitude.toFixed(5) == eventObj.gModel.center.lat().toFixed(5) &&
                            m[_this.options.center].longitude.toFixed(5) == eventObj.gModel.center.lng().toFixed(5) &&
                            m[_this.options.radius].toFixed(5) === eventObj.gModel.radius.toFixed(5)) {
                            model_1 = m;
                        }
                    }
                });
                eventObj.model = model_1;
            }
        };
        MapElementsCtrl.prototype.onRightclick = function (eventObj) {
            this.externalRightclick(eventObj);
            this.correctCircleModel(eventObj);
            this.togglePopup(eventObj);
        };
        MapElementsCtrl.prototype.onMousedown = function (eventObj) {
            this.start = new Date().getTime();
        };
        MapElementsCtrl.prototype.onMouseup = function (eventObj) {
            this.end = new Date().getTime();
            this.longClick = (this.end - this.start > 300);
        };
        MapElementsCtrl.prototype.togglePopup = function (eventObj) {
            if (!this.popup) {
                return;
            }
            this.popup.toggle(eventObj);
        };
        MapElementsCtrl.prototype.closePopup = function (eventObj) {
            if (!this.popup) {
                return;
            }
            this.popup.close();
        };
        MapElementsCtrl.prototype.getModels = function () {
            return this.models;
        };
        MapElementsCtrl.prototype.checkContainsModel = function (model) {
            return this.models.indexOf(model) > -1;
        };
        MapElementsCtrl.prototype.getPlural = function (id) {
            return this.getPlurals().get(id);
        };
        MapElementsCtrl.prototype.getPlurals = function () {
            return this.control.getPlurals();
        };
        MapElementsCtrl.prototype.updatePopupPosition = function (objEvent) {
            if (this.popUpOpened === objEvent.model.id) {
                this.popup.setPosition({
                    latitude: objEvent.position.lat(),
                    longitude: objEvent.position.lng()
                });
            }
        };
        MapElementsCtrl.prototype.freezeMap = function () {
            return this.mapCtrl.freeze();
        };
        MapElementsCtrl.prototype.unfreezeMap = function () {
            return this.mapCtrl.unfreeze();
        };
        MapElementsCtrl.prototype.setCursor = function (cursor) {
            return this.mapCtrl.setCursor(cursor);
        };
        return MapElementsCtrl;
    }
    angular.module('pipMapsElements')
        .factory('MapElementsCtrlFct', MapElementsCtrlFct);
})();
},{}],9:[function(require,module,exports){
(function () {
    'use strict';
    pipMapElementsFct.$inject = ['$timeout'];
    function pipMapElementsFct($timeout) {
        return {
            strict: 'AE',
            scope: {},
            require: ['^pipMap', 'pipMapElements'],
            link: function ($scope, $element, $attrs, $controllers) {
                var mapCtrl = $controllers[0];
                var elementController = $controllers[1];
                elementController.init(mapCtrl);
                $scope.$watch('ctrl.models', function (models) {
                    if (models) {
                        elementController.getBoundsToFitAsync().then(function (bounds) {
                            $timeout(mapCtrl.fitMapToBounds.bind(mapCtrl, bounds), 200);
                        });
                    }
                });
                $scope.$watch('ctrl.componentOptions.popup', function (popupOptions) {
                    elementController.setNewOptions(popupOptions);
                }, true);
            },
            bindToController: {
                componentOptions: '=pipOptions',
                models: '=pipModels'
            },
            controller: 'MapElementsCtrl',
            controllerAs: 'ctrl',
            templateUrl: 'elements/map-elements.html'
        };
    }
    angular.module('pipMapsElements')
        .factory('pipMapElementsFct', pipMapElementsFct);
})();
},{}],10:[function(require,module,exports){
(function () {
    'use strict';
    function mapElementsRequireFct() {
        return {
            elements: ['?^pipMapMarkers', '?^pipMapPolylines', '?^pipMapPolygons', '?^pipMapKml'],
            getType: function ($controllers, startIndex) {
                try {
                    return $controllers.slice(startIndex)
                        .map(function (ctrl, index) {
                        return ctrl && this.elements[index];
                    }, this)
                        .filter(function (ctrlName) {
                        return ctrlName;
                    })[0]
                        .replace('?^pipMap', '')
                        .toLowerCase();
                }
                catch (e) {
                    throw new Error('pip-map-editable-element can be used only with map elements directives');
                }
            },
            getController: function ($controllers, startIndex) {
                return $controllers.slice(startIndex)
                    .filter(function (ctrl) {
                    return ctrl;
                })[0];
            }
        };
    }
    angular.module('pipMapsElements')
        .factory('mapElementsRequireFct', mapElementsRequireFct);
})();
},{}],11:[function(require,module,exports){
(function () {
    'use strict';
    MapCirclesCtrlFct.$inject = ['MapElementsCtrlFct'];
    MapCirclesCtrlBuilder.$inject = ['$controller', '$scope', 'MapCirclesCtrlFct'];
    pipMapCircles.$inject = ['pipMapElementsFct'];
    function MapCirclesCtrlFct(MapElementsCtrlFct) {
        function MapCirclesCtrl($injector, $scope) {
            MapElementsCtrlFct.call(this, $injector, $scope);
            this.$parse = $injector.get('$parse');
        }
        var _super = MapElementsCtrlFct.prototype;
        MapCirclesCtrl.prototype = Object.create(_super);
        MapCirclesCtrl.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {
            stroke: 'stroke',
            fill: 'fill',
            radius: 'radius',
            center: 'center',
            fitBounds: false
        });
        MapCirclesCtrl.prototype.$onInit = function () {
            _super.$onInit.call(this);
            this.setPositionGetterSetter();
        };
        MapCirclesCtrl.prototype.setPositionGetterSetter = function () {
            var pathProp = this.options.path;
            this.getPosition = this.$parse(pathProp);
            this.setPosition = this.getPosition.assign;
        };
        MapCirclesCtrl.prototype.setDefaultPositionsIfNeeded = function (model) {
            var positions = this.getPosition(model);
            if (!angular.isArray(positions)) {
                this.setPosition(model, []);
            }
        };
        MapCirclesCtrl.prototype.getAllPositions = function () {
            var paths = _super.getAllPositions.call(this);
            return Array.prototype.concat.apply([], paths);
        };
        MapCirclesCtrl.prototype.setPosition = function (model, position) {
            model[this.defaultOptions.center] = position;
        };
        MapCirclesCtrl.prototype.getPosition = function (model) {
            return model[this.defaultOptions.center];
        };
        MapCirclesCtrl.prototype.isModelEmpty = function (model) {
            var position = this.getPosition(model);
            return !position;
        };
        return MapCirclesCtrl;
    }
    function MapCirclesCtrlBuilder($controller, $scope, MapCirclesCtrlFct) {
        var instance = $controller(MapCirclesCtrlFct, {
            $scope: $scope
        });
        angular.extend(instance, this);
        instance.$onInit();
        return instance;
    }
    function pipMapCircles(pipMapElementsFct) {
        return angular.extend({}, pipMapElementsFct, {
            require: ['^pipMap', 'pipMapCircles'],
            controller: 'MapCirclesCtrl',
            templateUrl: 'elements/circles/map-circles.html'
        });
    }
    angular.module('pipMapsElements')
        .factory('MapCirclesCtrlFct', MapCirclesCtrlFct)
        .controller('MapCirclesCtrl', MapCirclesCtrlBuilder)
        .directive('pipMapCircles', pipMapCircles);
})();
},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular.module('pipMapsElements', []);
require("./MapElementControllerService");
require("./MapElementDirectiveService");
require("./MapElementRequireService");
require("./kml/MapKml");
require("./markers/MapMarkers");
require("./polygons/MapPolygons");
require("./polylines/MapPolylines");
require("./circles/MapCircles");
},{"./MapElementControllerService":8,"./MapElementDirectiveService":9,"./MapElementRequireService":10,"./circles/MapCircles":11,"./kml/MapKml":13,"./markers/MapMarkers":14,"./polygons/MapPolygons":15,"./polylines/MapPolylines":16}],13:[function(require,module,exports){
(function () {
    'use strict';
    pipMapKml.$inject = ['pipMapElementsFct'];
    MapKmlCtrlFct.$inject = ['MapElementsCtrlFct'];
    MapKmlCtrlBuilder.$inject = ['$controller', '$scope', 'MapKmlCtrlFct'];
    function MapKmlCtrlFct(MapElementsCtrlFct) {
        function MapKmlCtrl($injector, $scope) {
            MapElementsCtrlFct.call(this, $injector, $scope);
            this.pipMapHelperSrv = $injector.get('pipMapHelperSrv');
            this.existingModels = [];
        }
        var _super = MapElementsCtrlFct.prototype;
        MapKmlCtrl.prototype = Object.create(_super);
        MapKmlCtrl.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {
            layer: {
                preserveViewport: true,
                suppressInfoWindows: true
            }
        });
        MapKmlCtrl.prototype.getPopupParameters = function () {
            if (!this.popup.model) {
                return {};
            }
            return {
                model: this.popup.model,
                position: this.popup.position,
                meta: this.popup.model.instance.getMetadata()
            };
        };
        MapKmlCtrl.prototype.update = function () {
            this.pipMapHelperSrv.whenReady.then(function () {
                this.removeOldModels();
                this.addNewModels();
            }.bind(this));
        };
        MapKmlCtrl.prototype.removeOldModels = function () {
            this.getOldModels()
                .forEach(function (model) {
                model.instance.setMap(null);
                this.deRegisterModel(model);
            }, this);
        };
        MapKmlCtrl.prototype.getOldModels = function () {
            var newUrls = this.models.map(function (model) {
                return model.url;
            });
            return this.existingModels
                .filter(function (model) {
                return newUrls.indexOf(model.url) === -1;
            });
        };
        MapKmlCtrl.prototype.addNewModels = function () {
            this.getNewModels()
                .forEach(function (model) {
                var copy = angular.copy(model);
                this.addModel(copy);
                this.registerModel(copy);
                this.addEvents(copy);
            }, this);
        };
        MapKmlCtrl.prototype.getNewModels = function () {
            var existingUrls = this.existingModels.map(function (model) {
                return model.url;
            });
            return this.models
                .filter(function (model) {
                return existingUrls.indexOf(model.url) === -1;
            });
        };
        MapKmlCtrl.prototype.addModel = function (model) {
            var mapInstance = this.mapCtrl.getMapInstance();
            var options = angular.merge({
                map: mapInstance,
                url: model.url
            }, this.options.layer);
            model.instance = this.pipMapHelperSrv.createKML(options);
        };
        MapKmlCtrl.prototype.addEvents = function (model) {
            var clickHandler = this.onEvent.bind(this, model, 'click');
            model.instance.addListener('click', clickHandler);
        };
        MapKmlCtrl.prototype.onEvent = function (model, name) {
            var args = this.copyArguments(arguments, 2);
            this.onEventHandler(model.instance, name, model, args);
        };
        MapKmlCtrl.prototype.copyArguments = function (args, startIndex) {
            var result = [];
            for (var i = 0; i < args.length - startIndex; ++i) {
                result[i] = args[i + startIndex];
            }
            return result;
        };
        MapKmlCtrl.prototype.getPopupMetaData = function () {
            return this.popup.model && this.popup.model.instance.getMetadata();
        };
        MapKmlCtrl.prototype.registerModel = function (model) {
            this.existingModels.push(model);
        };
        MapKmlCtrl.prototype.deRegisterModel = function (model) {
            var index = this.existingModels.indexOf(model);
            this.existingModels.splice(index, 1);
        };
        return MapKmlCtrl;
    }
    function MapKmlCtrlBuilder($controller, $scope, MapKmlCtrlFct) {
        var instance = $controller(MapKmlCtrlFct, {
            $scope: $scope
        });
        angular.extend(instance, this);
        instance.$onInit();
        return instance;
    }
    function pipMapKml(pipMapElementsFct) {
        var definition = angular.extend({}, pipMapElementsFct, {
            require: ['^pipMap', 'pipMapKml'],
            controller: 'MapKmlCtrl',
            templateUrl: 'elements/kml/map-kml.html'
        });
        var link = definition.link;
        definition.link = function ($scope, $element, $attrs, $controllers) {
            link.apply(this, arguments);
            var mapCtrl = $controllers[0];
            var elementController = $controllers[1];
            elementController.mapCtrl = mapCtrl;
            $scope.$watchCollection('ctrl.models', function (models) {
                if (models) {
                    elementController.update();
                }
            });
        };
        return definition;
    }
    angular.module('pipMapsElements')
        .directive('pipMapKml', pipMapKml)
        .factory('MapKmlCtrlFct', MapKmlCtrlFct)
        .controller('MapKmlCtrl', MapKmlCtrlBuilder);
})();
},{}],14:[function(require,module,exports){
(function () {
    'use strict';
    MapMarkersCtrlFct.$inject = ['MapElementsCtrlFct'];
    MapMarkersCtrlBuilder.$inject = ['$controller', '$scope', 'MapMarkersCtrlFct'];
    pipMapMarkers.$inject = ['pipMapElementsFct'];
    function MapMarkersCtrlFct(MapElementsCtrlFct) {
        function MapMarkersCtrl($injector, $scope) {
            MapElementsCtrlFct.call(this, $injector, $scope);
            this.$parse = $injector.get('$parse');
            this.pipMapHelperSrv = $injector.get('pipMapHelperSrv');
        }
        var _super = MapElementsCtrlFct.prototype;
        MapMarkersCtrl.prototype = Object.create(_super);
        MapMarkersCtrl.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {
            model: {
                coords: 'self',
                icon: 'icon'
            },
            connect: false
        });
        MapMarkersCtrl.prototype.$onInit = function () {
            _super.$onInit.call(this);
            this.setPositionGetterSetter();
            this.initConnect();
        };
        MapMarkersCtrl.prototype.initConnect = function () {
            if (!this.options.connect) {
                return;
            }
            var options = this.options.connect;
            this.connect = angular.merge({
                show: true
            }, options);
        };
        MapMarkersCtrl.prototype.setPositionGetterSetter = function () {
            var coordsProp = this.options.model.coords;
            if (coordsProp === 'self') {
                return;
            }
            this.getPosition = this.$parse(coordsProp);
            this.setPosition = this.getPosition.assign;
        };
        MapMarkersCtrl.prototype.setPosition = function (model, position) {
            angular.extend(model, position);
        };
        MapMarkersCtrl.prototype.onShowPopup = function (model) {
            this.popUpOpened = model.id;
            if (!this.options.popup.options.setPosition) {
                return;
            }
        };
        MapMarkersCtrl.prototype.onClosePopup = function () {
            this.popUpOpened = null;
        };
        MapMarkersCtrl.prototype.setIconActive = function (model) {
            if (!model || !model.icon) {
                return;
            }
            this.popupModel = model;
            this.pipMapHelperSrv.setIcon(this.popupModel.icon, true);
        };
        MapMarkersCtrl.prototype.resetIconActive = function () {
            if (!this.popupModel || !this.popupModel.icon) {
                return;
            }
            this.pipMapHelperSrv.setIcon(this.popupModel.icon, false);
            this.popupModel = null;
        };
        return MapMarkersCtrl;
    }
    function MapMarkersCtrlBuilder($controller, $scope, MapMarkersCtrlFct) {
        var instance = $controller(MapMarkersCtrlFct, {
            $scope: $scope
        });
        angular.extend(instance, this);
        instance.$onInit();
        return instance;
    }
    function pipMapMarkers(pipMapElementsFct) {
        return angular.extend({}, pipMapElementsFct, {
            require: ['^pipMap', 'pipMapMarkers'],
            controller: 'MapMarkersCtrl',
            templateUrl: 'elements/markers/map-markers.html'
        });
    }
    angular.module('pipMapsElements')
        .factory('MapMarkersCtrlFct', MapMarkersCtrlFct)
        .controller('MapMarkersCtrl', MapMarkersCtrlBuilder)
        .directive('pipMapMarkers', pipMapMarkers);
})();
},{}],15:[function(require,module,exports){
(function () {
    'use strict';
    MapPolygonsCtrlFct.$inject = ['MapElementsCtrlFct'];
    MapPolygonsCtrlBuilder.$inject = ['$controller', '$scope', 'MapPolygonsCtrlFct'];
    pipMapPolygons.$inject = ['pipMapElementsFct'];
    function MapPolygonsCtrlFct(MapElementsCtrlFct) {
        function MapPolygonsCtrl($injector, $scope) {
            MapElementsCtrlFct.call(this, $injector, $scope);
            this.$parse = $injector.get('$parse');
        }
        var _super = MapElementsCtrlFct.prototype;
        MapPolygonsCtrl.prototype = Object.create(_super);
        MapPolygonsCtrl.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {
            path: 'path',
            stroke: {
                color: '#ff6262',
                weight: 5
            },
            fitBounds: false
        });
        MapPolygonsCtrl.prototype.$onInit = function () {
            _super.$onInit.call(this);
            this.setPositionGetterSetter();
        };
        MapPolygonsCtrl.prototype.setPositionGetterSetter = function () {
            var pathProp = this.options.path;
            this.getPosition = this.$parse(pathProp);
            this.setPosition = this.getPosition.assign;
        };
        MapPolygonsCtrl.prototype.setDefaultPositionsIfNeeded = function (model) {
            var positions = this.getPosition(model);
            if (!angular.isArray(positions)) {
                this.setPosition(model, []);
            }
        };
        MapPolygonsCtrl.prototype.getAllPositions = function () {
            var paths = _super.getAllPositions.call(this);
            return Array.prototype.concat.apply([], paths);
        };
        MapPolygonsCtrl.prototype.setPosition = function (model, position) {
            model[this.defaultOptions.path] = position;
        };
        MapPolygonsCtrl.prototype.getPosition = function (model) {
            return model[this.defaultOptions.path];
        };
        MapPolygonsCtrl.prototype.isModelEmpty = function (model) {
            var position = this.getPosition(model);
            return !position || !position.length || !position[0].latitude || !position[0].longitude;
        };
        return MapPolygonsCtrl;
    }
    function MapPolygonsCtrlBuilder($controller, $scope, MapPolygonsCtrlFct) {
        var instance = $controller(MapPolygonsCtrlFct, {
            $scope: $scope
        });
        angular.extend(instance, this);
        instance.$onInit();
        return instance;
    }
    function pipMapPolygons(pipMapElementsFct) {
        return angular.extend({}, pipMapElementsFct, {
            require: ['^pipMap', 'pipMapPolygons'],
            controller: 'MapPolygonsCtrl',
            templateUrl: 'elements/polygons/map-polygons.html'
        });
    }
    angular.module('pipMapsElements')
        .factory('MapPolygonsCtrlFct', MapPolygonsCtrlFct)
        .controller('MapPolygonsCtrl', MapPolygonsCtrlBuilder)
        .directive('pipMapPolygons', pipMapPolygons);
})();
},{}],16:[function(require,module,exports){
(function () {
    'use strict';
    MapPolylinesCtrlFct.$inject = ['MapPolygonsCtrlFct'];
    MapPolylinesCtrlBuilder.$inject = ['$controller', '$scope', 'MapPolylinesCtrlFct'];
    pipMapPolylines.$inject = ['pipMapElementsFct'];
    function MapPolylinesCtrlFct(MapPolygonsCtrlFct) {
        function MapPolylinesCtrl($injector, $scope) {
            MapPolygonsCtrlFct.call(this, $injector, $scope);
        }
        var _super = MapPolygonsCtrlFct.prototype;
        MapPolylinesCtrl.prototype = Object.create(_super);
        MapPolylinesCtrl.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {});
        return MapPolylinesCtrl;
    }
    function MapPolylinesCtrlBuilder($controller, $scope, MapPolylinesCtrlFct) {
        var instance = $controller(MapPolylinesCtrlFct, {
            $scope: $scope
        });
        angular.extend(instance, this);
        instance.$onInit();
        return instance;
    }
    function pipMapPolylines(pipMapElementsFct) {
        return angular.extend({}, pipMapElementsFct, {
            require: ['^pipMap', 'pipMapPolylines'],
            controller: 'MapPolylinesCtrl',
            templateUrl: 'elements/polylines/map-polylines.html'
        });
    }
    angular.module('pipMapsElements')
        .factory('MapPolylinesCtrlFct', MapPolylinesCtrlFct)
        .controller('MapPolylinesCtrl', MapPolylinesCtrlBuilder)
        .directive('pipMapPolylines', pipMapPolylines);
})();
},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./popup");
require("./elements");
require("./edit");
{
    angular.module('pipMaps', [
        'uiGmapgoogle-maps',
        'pipMaps.Templates',
        'pipMapsPopup',
        'pipMapsElements',
        'pipMapsEdit'
    ]);
}
require("./config");
require("./GoogleMapsRemoveAfterService");
require("./HelpService");
require("./Map");
require("./MapEventHandlerService");
},{"./GoogleMapsRemoveAfterService":1,"./HelpService":2,"./Map":3,"./MapEventHandlerService":4,"./config":5,"./edit":7,"./elements":12,"./popup":22}],18:[function(require,module,exports){
(function () {
    'use strict';
    MapElementPopupFct.$inject = ['$injector'];
    function MapElementPopupFct($injector) {
        var pipMapHelperSrv = $injector.get('pipMapHelperSrv');
        var $rootScope = $injector.get('$rootScope');
        function MapElementPopupFct(options) {
            var er = new Error();
            var offset = pipMapHelperSrv.createSize(options.offset.width, options.offset.height);
            this.options = angular.merge({
                boxClass: 'pip-map-info-window ' + options.className,
                closeBoxURL: '',
                pixelOffset: offset
            }, options.options);
            this.templateUrl = options.templateUrl;
            this.onShow = options.onShow;
            this.onClose = options.onClose;
            this.initBreakpoints(options.offset.breakpoints);
        }
        MapElementPopupFct.prototype.initBreakpoints = function (breakpoints) {
            breakpoints = breakpoints || [];
            this.breakpoints = breakpoints.map(function (breakpoint) {
                return {
                    name: breakpoint.name,
                    offset: pipMapHelperSrv.createSize(breakpoint.width, breakpoint.height)
                };
            }, this);
            this.defaultOffset = this.options.pixelOffset;
        };
        MapElementPopupFct.prototype.setNewOptions = function (options) {
            var offset = pipMapHelperSrv.createSize(options.offset.width, options.offset.height);
            this.options = angular.merge({
                boxClass: 'pip-map-info-window ' + options.className,
                closeBoxURL: '',
                pixelOffset: offset
            }, options.options);
            this.initBreakpoints(options.offset.breakpoints);
            this.fitOffset();
        };
        MapElementPopupFct.prototype.close = function () {
            this.onClose();
        };
        MapElementPopupFct.prototype.show = function (model) {
            this.onShow(model);
            this.fitOffset();
        };
        MapElementPopupFct.prototype.setPosition = function () {
            this.fitOffset();
        };
        MapElementPopupFct.prototype.fitOffset = function () {
            var hasBreakpoint = this.breakpoints.some(function (breakpoint) {
                var isTargetBreakpoint = $rootScope.utils.hasBreakpoint(breakpoint.name);
                if (isTargetBreakpoint) {
                    this.options.pixelOffset = breakpoint.offset;
                    return true;
                }
            }, this);
            if (!hasBreakpoint) {
                this.options.pixelOffset = this.defaultOffset;
            }
        };
        return {
            create: function (options) {
                return new MapElementPopupFct(options);
            }
        };
    }
    angular.module('pipMapsPopup')
        .factory('MapElementPopupFct', MapElementPopupFct);
})();
},{}],19:[function(require,module,exports){
(function () {
    'use strict';
    function mapPopup() {
        return {
            strict: 'A',
            scope: {
                popup: '=pipMapPopup'
            },
            templateUrl: 'popup/map-popup.html'
        };
    }
    angular.module('pipMapsPopup')
        .directive('pipMapPopup', mapPopup);
})();
},{}],20:[function(require,module,exports){
(function () {
    'use strict';
    function mapPopupContent() {
        return {
            strict: 'AE',
            transclude: true,
            templateUrl: 'popup/map-popup-content.html'
        };
    }
    angular.module('pipMapsPopup')
        .directive('pipMapPopupContent', mapPopupContent);
})();
},{}],21:[function(require,module,exports){
(function () {
    'use strict';
    MapPopupFct.$inject = ['$injector'];
    function MapPopupFct($injector) {
        var MapElementPopup = $injector.get('MapElementPopupFct');
        var $rootScope = $injector.get('$rootScope');
        var $timeout = $injector.get('$timeout');
        function MapPopupFct() {
            this.elements = [];
        }
        MapPopupFct.prototype.add = function (options) {
            var _this = this;
            var element = MapElementPopup.create(options);
            this.elements.push(element);
            return {
                toggle: this.toggle.bind(this, element),
                close: this.close.bind(this, element),
                setPosition: function (position) {
                    if (_this.element.options.updatePosition === false)
                        return;
                    _this.position = position;
                },
                setNewOptions: function (options) {
                    element.setNewOptions(options);
                }
            };
        };
        MapPopupFct.prototype.toggle = function (element, eventObj) {
            if (this.isNewModel(eventObj)) {
                this.close();
                this.element = element;
                $timeout(function () {
                    this.show(element);
                }.bind(this), 10);
                this.setPosition(eventObj);
                return;
            }
            this.close();
        };
        MapPopupFct.prototype.isNewModel = function (eventObj) {
            return this.model !== eventObj.model;
        };
        MapPopupFct.prototype.show = function (element) {
            if (!this.model || !this.position) {
                return;
            }
            this.isEnabled = true;
            this.setBreakpointHandler(element);
        };
        MapPopupFct.prototype.setPosition = function (eventObj) {
            this.position = this.getPosition(eventObj);
            this.model = eventObj.model;
            this.element.show(this.model);
        };
        MapPopupFct.prototype.setBreakpointHandler = function (element) {
            this.removeBreakpointHandler = $rootScope.$on('pipMainLayoutResized', element.setPosition.bind(element));
        };
        MapPopupFct.prototype.resetBreakpointHandler = function () {
            if (this.removeBreakpointHandler)
                this.removeBreakpointHandler();
        };
        MapPopupFct.prototype.close = function () {
            if (!this.element) {
                return;
            }
            this.element.close();
            this.resetBreakpointHandler();
            this.model = null;
            this.isEnabled = false;
            this.position = null;
            this.element = null;
        };
        MapPopupFct.prototype.getPosition = function (eventObj) {
            return eventObj.position;
        };
        return {
            create: function () {
                return new MapPopupFct();
            }
        };
    }
    angular.module('pipMapsPopup')
        .factory('MapPopupFct', MapPopupFct);
})();
},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    angular.module('pipMapsPopup', []);
}
require("./MapElementPopupService");
require("./MapPopup");
require("./MapPopupContent");
require("./MapPopupService");
},{"./MapElementPopupService":18,"./MapPopup":19,"./MapPopupContent":20,"./MapPopupService":21}],23:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('map.html',
    '<div class="pip-map-side-panel flex-fixed flex-order-1" ng-if="ctrl.sidePanel.show"><ng-include src="ctrl.sidePanel.template"></ng-include></div><ui-gmap-google-map class="flex pip-map-provider-wrapper" control="ctrl.componentOptions.control" center="ctrl.map.center" zoom="ctrl.map.zoom" options="ctrl.map.options" bounds="ctrl.map.bounds" events="ctrl.map.events"><div pip-map-popup="ctrl.popup" ng-if="ctrl.popup"></div><ng-transclude></ng-transclude></ui-gmap-google-map>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('edit/MapEdit.html',
    '<pip-map pip-options="$ctrl.map"><ui-gmap-drawing-manager options="$ctrl.drawingManagerOptions" control="$ctrl.drawingManagerControl"></ui-gmap-drawing-manager><pip-map-polygons pip-models="$ctrl.disabledPolygons" pip-options="$ctrl.disabledPolygonsOptions"></pip-map-polygons><pip-map-polylines pip-models="$ctrl.disabledPolylines" pip-options="$ctrl.disabledPolylinesOptions"></pip-map-polylines><pip-map-circles pip-models="$ctrl.disabledCircles" pip-options="$ctrl.disabledCirclesOptions"></pip-map-circles></pip-map><div class="action-panel w-stretch layout-row layout-align-center-center" ng-if="$ctrl.showPanel"><div class="action-buttons color-primary-bg flex-fixed"><md-button ng-click="$ctrl.clearMap()" ng-if="$ctrl.showAction(\'clear\')">{{ \'CLEAR_MAP\' | translate }}</md-button><md-button ng-click="$ctrl.addCircle()" ng-if="$ctrl.showAction(\'circle\')">{{ \'ADD_CIRCLE\' | translate }}</md-button><md-button ng-click="$ctrl.addPolygon()" ng-if="$ctrl.showAction(\'polygon\')">{{ \'ADD_POLYGON\' | translate }}</md-button><md-button ng-click="$ctrl.addLine()" ng-if="$ctrl.showAction(\'line\')">{{ \'ADD_LINE\' | translate }}</md-button></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('edit_old/map-edit-tool.html',
    '<div layout="column" class="pip-map-edit-tool theme-text-primary" ng-init="currentElement = editCtrl.currentElement; tool = currentElement.tool; model = tool.currentModel"><header hide-xs="" class="pip-map-edit-header" layout="column" layout-align="space-between"><h2 class="md-title">{{:: currentElement.getEditTitle() }}</h2><div class="pip-map-edit-actions" layout="row"><span class="pip-map-edit-actions-block-main"><md-button ng-click="tool.undo()" ng-disabled="tool.isUndoDisabled()"><md-icon md-svg-icon="map:undo" aria-label="Undo"></md-icon></md-button></span><md-divider></md-divider><span class="pip-map-edit-actions-block-tool"><md-button ng-repeat="action in tool.actions" ng-disabled="tool.isActionDisabled(action)" ng-click="tool.setAction(action)"><md-icon md-svg-icon="{{:: action.definition.icon }}" aria-label="{{:: action.definition.name }}" ng-class="{ active: tool.isActionActive(action) }"></md-icon></md-button></span></div></header><header hide-gt-xs="" class="pip-map-edit-header" layout="column" layout-align="space-between"><form name="editCtrl.modelForm" ng-include="editCtrl.currentElement.tool.template"></form></header><md-divider></md-divider><section flex="auto" class="pip-map-edit-content"><form hide-xs="" name="editCtrl.modelForm" ng-include="editCtrl.currentElement.tool.template"></form></section><md-divider></md-divider><footer hide-xs="" class="pip-map-edit-footer" layout="row" layout-align="end center"><div flex=""><md-button ng-click="editCtrl.remove()">{{:: \'DELETE\' | translate }} {{:: currentElement.name }}</md-button></div><md-button ng-click="editCtrl.cancel()">{{:: \'CANCEL\' | translate }}</md-button><md-button ng-click="editCtrl.save()" ng-disabled="editCtrl.modelForm.$invalid">{{:: tool.titleSave | translate }}</md-button></footer><footer hide-gt-xs="" class="pip-map-edit-footer" layout="row" layout-align="start center"><div layout="row" layout-align="space-around"><md-button ng-click="tool.undo()" ng-disabled="tool.isUndoDisabled()"><md-icon md-svg-icon="map:undo" aria-label="Remove"></md-icon></md-button></div><md-divider></md-divider><md-menu flex="" layout="column"><md-button class="pip-map-edit-actions-trigger" ng-click="$mdOpenMenu($event)"><md-icon class="active" md-svg-icon="{{ tool.currentAction.definition.icon }}" aria-label="Trigger menu" md-menu-origin=""></md-icon><md-icon md-svg-icon="map:tools" aria-label="Triangle down"></md-icon></md-button><md-menu-content width="4"><md-menu-item ng-repeat="action in tool.actions"><md-button ng-click="tool.setAction(action)" ng-disabled="tool.isActionDisabled(action)"><md-icon md-svg-icon="{{:: action.definition.icon }}" aria-label="{{:: action.definition.name }}" ng-class="{ active: tool.isActionActive(action) }" md-menu-align-target=""></md-icon>{{:: action.definition.name }}</md-button></md-menu-item></md-menu-content></md-menu><md-divider></md-divider><div layout="row" layout-align="space-around"><md-button ng-click="editCtrl.cancel()"><md-icon md-svg-icon="map:cross" aria-label="Close"></md-icon></md-button><md-button ng-click="editCtrl.save()" ng-disabled="editCtrl.modelForm.$invalid"><md-icon md-svg-icon="map:check" aria-label="Sumbit"></md-icon></md-button></div></footer></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('edit_old/map-edit-tools-list.html',
    '<md-fab-speed-dial class="pip-floating-button map-add-button md-scale" md-direction="up" md-open="fab.isOpen"><md-fab-trigger><md-button class="md-fab" ng-class="{\'md-accent md-raised\': !fab.isOpen, \'md-warn\': fab.isOpen}"><md-icon md-svg-icon="map:plus" aria-label="Open" class="md-headline centered-add-icon" ng-if="!fab.isOpen"></md-icon><md-icon md-svg-icon="map:cross" aria-label="Close" class="md-headline centered-add-icon" ng-if="fab.isOpen"></md-icon></md-button></md-fab-trigger><md-fab-actions class="pip-map-edit-tools-list"><div ng-repeat="element in ::editCtrl.elements"><span class="pip-map-edit-tooltip">{{:: element.name }}</span><md-button class="md-fab md-raised md-mini" ng-click="editCtrl.createElement(element)"><md-icon md-svg-icon="{{:: element.icon }}" aria-label="{{:: element.icon }}"></md-icon></md-button></div></md-fab-actions></md-fab-speed-dial>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('edit_old/map-edit.html',
    '<script type="text/ng-template" id="map-icons.svg"><svg xmlns="http://www.w3.org/2000/svg"> <defs> <g id="trash" transform="translate(512,0) scale(-1,1) rotate(180,256,256)"><path d="M128 107c0-24 19-43 43-43l170 0c24 0 43 19 43 43l0 256-256 0z m277 320l-74 0-22 21-106 0-22-21-74 0 0-43 298 0z"/></g> <g id="plus" transform="translate(512,0) scale(-1,1) rotate(180,256,256)"><path d="M405 235l-128 0 0-128-42 0 0 128-128 0 0 42 128 0 0 128 42 0 0-128 128 0z"/></g> <g id="cross" transform="translate(512,0) scale(-1,1) rotate(180,256,256)"><path d="M405 375l-30 30-119-119-119 119-30-30 119-119-119-119 30-30 119 119 119-119 30 30-119 119z"/></g> <g id="undo" transform="translate(512,0) scale(-1,1) rotate(180,256,256)"><path d="M213 320l0 85-149-149 149-149 0 87c107 0 182-34 235-109-21 107-85 214-235 235z"/></g> <g id="check" transform="translate(512,0) scale(-1,1) rotate(180,256,256)"><path d="M192 167l-89 89-30-30 119-119 256 256-30 30z"/></g> <g id="tools" transform="translate(512,0) scale(-1,1) rotate(180,256,256)"><path d="M149 299l107-107 107 107z"/></g> <g id="add-point" transform="translate(0,0) scale(25)"><path class="cls-1" d="M8.46,9l2.81-.17a0.31,0.31,0,0,0,.2-0.53L3.4,0.09A0.31,0.31,0,0,0,2.87.3V11.81a0.31,0.31,0,0,0,.51.23L5.51,10.2l1.9,4.64a0.31,0.31,0,0,0,.4.17l2.37-1a0.31,0.31,0,0,0,.17-0.4Z"/><polygon class="cls-1" points="14.96 15.62 14.96 12.72 13.49 12.72 13.49 15.62 10.59 15.62 10.59 17.1 13.49 17.1 13.49 20 14.96 20 14.96 17.1 17.87 17.1 17.87 15.62 14.96 15.62"/></g> <g id="remove-point" transform="translate(0,0) scale(25)"><path class="cls-1" d="M8.46,9l2.81-.17a0.31,0.31,0,0,0,.2-0.53L3.4,0.09a0.31,0.31,0,0,0-.53.22V11.82a0.31,0.31,0,0,0,.51.23l2.12-1.84,1.9,4.64a0.31,0.31,0,0,0,.4.17l2.37-1a0.31,0.31,0,0,0,.17-0.4Z"/><rect class="cls-1" x="10.58" y="15.63" width="7.28" height="1.48"/></g> <g id="pan" transform="translate(0,0) scale(25)"><path d="M15.28,6.56V9H11V4.74h2.41a0.31,0.31,0,0,0,.24-0.51L10.24,0.13a0.31,0.31,0,0,0-.47,0L6.31,4.23a0.31,0.31,0,0,0,.24.51H9V9H4.72V6.56a0.31,0.31,0,0,0-.51-0.24L0.11,9.78a0.31,0.31,0,0,0,0,.47l4.11,3.46a0.31,0.31,0,0,0,.51-0.24V11.07H9v4.23H6.54a0.31,0.31,0,0,0-.24.51l3.46,4.11a0.31,0.31,0,0,0,.47,0l3.46-4.11a0.31,0.31,0,0,0-.24-0.51H11V11.07h4.23v2.41a0.31,0.31,0,0,0,.51.24l4.11-3.46a0.31,0.31,0,0,0,0-.47L15.78,6.32A0.31,0.31,0,0,0,15.28,6.56Z"/></g> <g id="pen" transform="translate(0,0) scale(25)"><path d="M18.92,1.08a3.27,3.27,0,0,0-2.33-1,3.9,3.9,0,0,0-2.71,1.25,3.47,3.47,0,0,0-.44.54L5.66,10.66l-0.43-.43A0.36,0.36,0,0,0,5,10.12a0.39,0.39,0,0,0-.27.11L3.62,11.31a0.38,0.38,0,0,0,0,.53l0.45,0.45a8,8,0,0,1-2.46,1.09,0.54,0.54,0,0,0-.35.38v0S1,18.13,0,19.43a0.36,0.36,0,0,0,0,.36h0l0.13,0.14h0A0.57,0.57,0,0,0,.43,20a0.27,0.27,0,0,0,.13,0c1.42-.82,5.62-1.22,5.66-1.22h0a0.55,0.55,0,0,0,.38-0.35,9.52,9.52,0,0,1,1.1-2.45l0.44,0.44a0.36,0.36,0,0,0,.26.11,0.38,0.38,0,0,0,.27-0.11l1.07-1.07A0.39,0.39,0,0,0,9.87,15a0.36,0.36,0,0,0-.11-0.27l-0.43-.43,8.83-7.79a3.46,3.46,0,0,0,.54-0.44,4,4,0,0,0,1.24-2.47A3.22,3.22,0,0,0,18.92,1.08ZM4.66,17a1.15,1.15,0,1,1,0-1.63A1.15,1.15,0,0,1,4.66,17Z"/></g> <g id="select" transform="translate(0,0) scale(25)"><path d="M15.66,11.25L4.71,0.09a0.31,0.31,0,0,0-.53.22V15.94a0.31,0.31,0,0,0,.51.23l3-2.57,2.54,6.21a0.31,0.31,0,0,0,.4.17l3.31-1.35a0.31,0.31,0,0,0,.17-0.4L11.54,12l3.92-.24A0.31,0.31,0,0,0,15.66,11.25Z"/></g> <g id="hand" transform="translate(0,0) scale(25)"><path d="M16.9,3.52a0.92,0.92,0,0,0-.92.92v4a0.44,0.44,0,0,1-.88,0V1.76a1.1,1.1,0,0,0-2.21,0V8.44h0a0.42,0.42,0,0,1-.83,0V1.2a1.2,1.2,0,0,0-2.39,0s0,7.19,0,7.27a0.4,0.4,0,0,1-.8,0V2.24a1.2,1.2,0,1,0-2.39,0c0,8.67,0,7.67,0,8.39a2,2,0,0,1-.13,1c-0.11.08-.25,0-0.43-0.26C5.51,10.79,4.13,9,2.79,9.63a1.33,1.33,0,0,0-.33,1.93s3,4.34,4,5.84c0.59,0.88.75,1.16,1,1.45C8.15,20,8.58,20,9.84,20H15c2.79,0,2.79-3.31,2.79-4.73V4.94C17.82,3.93,17.41,3.52,16.9,3.52Z"/></g> <g id="draw" transform="translate(0,0) scale(25)"><path d="M1.94,4.37L0,2.49A2.08,2.08,0,0,1,.19,2.27L0.41,2l0.27-.26A2.84,2.84,0,0,0,1,1.48l0.39-.34A5.66,5.66,0,0,1,2,.68,6.24,6.24,0,0,1,2.92.27,3,3,0,0,1,4,.09a2.72,2.72,0,0,1,.81.15A2.6,2.6,0,0,1,5.7.79a2.85,2.85,0,0,1,.74,1,3.49,3.49,0,0,1,.3,1.54,4.64,4.64,0,0,1-.1,1,4.76,4.76,0,0,1-.28.88Q6.14,5.59,5.88,6t-0.59.88l-0.46.75q-0.28.46-.59,1L3.68,9.75a9.54,9.54,0,0,0-.43,1,4.27,4.27,0,0,0-.15.85,2,2,0,0,0,.05.67,1,1,0,0,0,.19.45,0.42,0.42,0,0,0,.32.17A0.72,0.72,0,0,0,4,12.79a1.59,1.59,0,0,0,.34-0.26,2.42,2.42,0,0,0,.3-0.3L4.9,12l0.4-.48L6,10.65l0.77-.93q0.39-.46.62-0.77T8.26,8A9.38,9.38,0,0,1,9.5,7a8.58,8.58,0,0,1,1.57-.84,4.66,4.66,0,0,1,1.78-.35,4,4,0,0,1,2,.46,4.25,4.25,0,0,1,1.33,1.16A4.89,4.89,0,0,1,17,9a8.61,8.61,0,0,1,.32,1.48H20V13.2H17.29a9.87,9.87,0,0,1-.74,3.25,7.19,7.19,0,0,1-1.33,2.06,4.55,4.55,0,0,1-1.6,1.08,4.31,4.31,0,0,1-1.5.31,3.5,3.5,0,0,1-1.37-.27,3.43,3.43,0,0,1-1.11-.74,3.47,3.47,0,0,1-.77-1.08,3.12,3.12,0,0,1-.28-1.32,4.63,4.63,0,0,1,.35-1.61A6.43,6.43,0,0,1,10,13.1a7.75,7.75,0,0,1,1.85-1.55,7.63,7.63,0,0,1,2.67-1q-0.05-.31-0.1-0.66a1.6,1.6,0,0,0-.23-0.63,1.25,1.25,0,0,0-.55-0.49,2.45,2.45,0,0,0-1-.18A2.09,2.09,0,0,0,11.5,9a8.11,8.11,0,0,0-1.17.9q-0.57.57-1.15,1.24T8.1,12.4L7.23,13.46a10.26,10.26,0,0,1-.83.88,6.4,6.4,0,0,1-.81.7,2.76,2.76,0,0,1-.86.41,3.09,3.09,0,0,1-.75.12,4.28,4.28,0,0,1-.75,0,4,4,0,0,1-.74-0.22,3,3,0,0,1-.66-0.37A3.32,3.32,0,0,1,.72,13.56a5.4,5.4,0,0,1-.28-0.92,4.69,4.69,0,0,1-.1-1A5.76,5.76,0,0,1,.8,9.5a21.73,21.73,0,0,1,1-2.15q0.57-1,1.07-1.74l0.61-.89,0.27-.46A3,3,0,0,0,4,3.75,0.91,0.91,0,0,0,4.05,3.3,0.38,0.38,0,0,0,3.82,3a0.42,0.42,0,0,0-.34.05A2.67,2.67,0,0,0,3,3.34L2.5,3.81Q2.22,4.06,1.94,4.37ZM12.15,17.23A1.36,1.36,0,0,0,12.81,17a2.31,2.31,0,0,0,.68-0.63,4.77,4.77,0,0,0,.62-1.17,7.65,7.65,0,0,0,.41-1.85A4.78,4.78,0,0,0,13,14a4.59,4.59,0,0,0-1,.85,3.77,3.77,0,0,0-.53.88,1.89,1.89,0,0,0-.17.67,0.74,0.74,0,0,0,.08.34,0.76,0.76,0,0,0,.21.26,0.66,0.66,0,0,0,.25.15A0.79,0.79,0,0,0,12.15,17.23Z"/></g> <g id="point" transform="translate(0,0) scale(25)"><path d="M10,0a6.88,6.88,0,0,1,4.94,2.06A6.88,6.88,0,0,1,17,7q0,3.93-7,13Q3,10.94,3,7A6.88,6.88,0,0,1,5.06,2.06,6.88,6.88,0,0,1,10,0Zm0,9.51a2.41,2.41,0,0,0,1-.2,2.34,2.34,0,0,0,.78-0.55A2.34,2.34,0,0,0,12.31,8a2.47,2.47,0,0,0,0-1.94,2.34,2.34,0,0,0-.55-0.78A2.34,2.34,0,0,0,11,4.7,2.47,2.47,0,0,0,9,4.7a2.34,2.34,0,0,0-.78.55A2.34,2.34,0,0,0,7.69,6,2.47,2.47,0,0,0,7.69,8a2.34,2.34,0,0,0,.55.78A2.34,2.34,0,0,0,9,9.31,2.41,2.41,0,0,0,10,9.51Z"/></g> </defs></svg></script>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('popup/map-popup-content.html',
    '<div class="map-popup-content"><md-content md-theme="{{:: $root.$theme || \'blue\' }}" flex=""><md-button class="md-icon-button pip-map-info-window-close-button" ng-click="closeClick(); $event.stopPropagation()" tabindex="-1" aria-label="close"><md-icon class="theme-icon-active" md-svg-icon="icons:cross"></md-icon></md-button><ng-transclude></ng-transclude></md-content><div class="pip-map-info-window-arrow-wrapper"><div><div></div></div><div><div></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('popup/map-popup.html',
    '<ui-gmap-window ng-if="popup.isEnabled" show="popup.isEnabled" coords="popup.position" templateurl=":: popup.element.templateUrl" templateparameter=":: popup" options=":: popup.element.options" closeclick="popup.close()"></ui-gmap-window>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('elements/circles/map-circles.html',
    '<ui-gmap-circle ng-repeat="c in ctrl.models" center="c[ctrl.options.center]" stroke="c[ctrl.options.stroke]" fill="c[ctrl.options.fill]" radius="c[ctrl.options.radius]" geodesic="c.geodesic" events="ctrl.events" visible="true"></ui-gmap-circle>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('elements/kml/map-kml.html',
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('elements/markers/map-markers.html',
    '<ui-gmap-markers models="ctrl.models" coords=":: ctrl.options.model.coords" icon=":: ctrl.options.model.icon" options="\'options\'" control=":: ctrl.control" events=":: ctrl.events" fit=":: ctrl.options.fitBounds"></ui-gmap-markers><ui-gmap-polylines ng-if=":: ctrl.connect" models="ctrl.models" path=":: ctrl.connect.property" stroke=":: ctrl.connect.stroke" icons=":: ctrl.connect.icons"></ui-gmap-polylines>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('elements/polygons/map-polygons.html',
    '<ui-gmap-polygons models="ctrl.models" path="ctrl.options.path" stroke="ctrl.options.stroke" fill="ctrl.options.fill" control="ctrl.control" events="ctrl.events" visible="\'visible\'" geodesic="\'geodesic\'" editable="\'editable\'" draggable="\'draggable\'" fit=":: ctrl.options.fitBounds"></ui-gmap-polygons>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('elements/polylines/map-polylines.html',
    '<ui-gmap-polylines models="ctrl.models" path="ctrl.options.path" stroke="ctrl.options.stroke" icons="ctrl.options.icons" control="ctrl.control" events="ctrl.events" visible="\'visible\'" geodesic="\'geodesic\'" editable="\'editable\'" draggable="\'draggable\'" static="ctrl.options.static" fit="ctrl.options.fitBounds"></ui-gmap-polylines>');
}]);
})();



},{}]},{},[17,23])(23)
});

//# sourceMappingURL=pip-suite-map.js.map
