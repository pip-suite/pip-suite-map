declare let google: any;

(() => {
    'use strict';

    /**
     * @ngdoc module
     * @name pipGoogleMaps
     *
     * @description
     * Module with common helper functionality for Google Maps
     */

    /**
     * @ngdoc provider
     * @name pipGoogleMaps
     */
    function GoogleMapsProvider() {

        var mapOptions = {
            mapTypeId: google.maps.MapTypeId.SATELLITE,
            disableDefaultUI: true,
            panControl: false,
            zoomControl: false
        };

        /**
         * Getter/setter for Google Maps options.
         * @param {Object} options @link https://developers.google.com/maps/documentation/javascript/reference#MapOptions
         * @returns {Object}
         */
        this.mapOptions = function (options) {
            mapOptions = _.defaults({}, options, mapOptions);

            return _.cloneDeep(mapOptions);
        };

        this.$get = function ($rootScope) {
            return {
                /**
                 * Getter for Google Maps options.
                 * @returns {Object} @link https://developers.google.com/maps/documentation/javascript/reference#MapOptions
                 */
                mapOptions: function () {
                    return _.cloneDeep(mapOptions);
                },

                /**
                 * Helper function to create new Angular Google Maps object. @link http://angular-ui.github.io/angular-google-maps/#!/api/google-map
                 * @param {Object} (options={}) - additional map options
                 * @param {Number} (options.maxZoom) - max map zoom level
                 * @param {Number} (options.minZoom) - min map zoom level
                 * @param {Object} (geoRegion) - object with coordinates of map bounds. Has specific format.
                 * @param {Object} geoRegion.boundary - map bounds object
                 * @param {Number} geoRegion.boundary.nw_lat - North-West latitude
                 * @param {Number} geoRegion.boundary.nw_lob - North-West longitude
                 * @param {Number} geoRegion.boundary.se_lat - South-East latitude
                 * @param {Number} geoRegion.boundary.se_lon - South-East longitude
                 * @param {Function} (onMapClickCallback) - function to call when map itself is clicked
                 * @returns {Object}
                 */
                map: function (options, geoRegion, onMapClickCallback) {
                    options || (options = {});

                    var onTilesLoaded = _.once(function (map) {
                        google.maps.event.trigger(map, 'resize');  // fix map is not fully loaded issue
                    });

                  var boundary = geoRegion && geoRegion.boundary || {};

                    return {
                        center: {
                            latitude:  (boundary.nw_lat + boundary.se_lat) / 2 || 0,
                            longitude: (boundary.nw_lon + boundary.se_lon) / 2 || 0
                        },
                        zoom: 16,
                        control: {},
                        options: _.assign({}, options, mapOptions),
                        bounds: {},
                        events: {
                            click: onMapClickCallback || function () {},
                            tilesloaded: onTilesLoaded,
                            zoom_changed: onZoomChanged
                        }
                    };

                    function onZoomChanged(map) {
                        var directiveSpecificMaxZoomLevel = options.maxZoomLevel,
                            directiveSpecificMinZoomLevel = options.minZoomLevel,
                            maxZoomLevel = directiveSpecificMaxZoomLevel == null ? mapOptions['maxZoom'] : directiveSpecificMaxZoomLevel,
                            minZoomLevel = directiveSpecificMinZoomLevel == null ? mapOptions['minZoom'] : directiveSpecificMinZoomLevel,
                            currentZoomLevel = map.getZoom();

                        if (currentZoomLevel > maxZoomLevel) {
                            map.setZoom(maxZoomLevel);
                        } else if (currentZoomLevel < minZoomLevel) {
                            map.setZoom(minZoomLevel);
                        }
                    }
                },

                /**
                 * Helper function to create new info window object. @link http://angular-ui.github.io/angular-google-maps/#!/api/window
                 * @param {String} (additionalClass="") - additional classes to append to info window along with default "pip-map-info-window"
                 * @param {google.maps.Size} (offset=new google.maps.Size(-175, -210, 'px', 'px')) - offset of info window from marker
                 * @returns {Object}
                 */
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

                /**
                 * Set map bounds
                 * @param {Object} map - Angular Google Maps object
                 * @param {Object} geoRegion - object with coordinates of map bounds. Has specific format.
                 * @param {Object} geoRegion.boundary - map bounds object
                 * @param {Number} geoRegion.boundary.nw_lat - North-West latitude
                 * @param {Number} geoRegion.boundary.nw_lob - North-West longitude
                 * @param {Number} geoRegion.boundary.se_lat - South-East latitude
                 * @param {Number} geoRegion.boundary.se_lon - South-East longitude
                 */
                setMapBounds: function (map, geoRegion) {
                    var unwatchBoundsChange = $rootScope.$watch(function() {
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

                /**
                 * Fit map to specified bounds
                 * @param {Object} map - Angular Google Maps object
                 * @param {google.maps.LatLngBounds} bounds - bounds, @link https://developers.google.com/maps/documentation/javascript/reference#LatLngBounds
                 */
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
        };
    }

    angular
        .module('pipMaps')
        .provider('pipGoogleMaps', <any>GoogleMapsProvider);
})();
