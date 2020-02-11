(() => {
  'use strict';

  function uiGmapModelKeyDecorator($delegate) {
    /**
     * This is a hot fix to the setChildScope problem
     * @see https://github.com/angular-ui/angular-google-maps/issues/1562
     * The issue is that ModelKey.prototype.setChildScope sets childScope.model = model;
     * where model is always for some reason is undefined
     * then in BasePolysParentModel.prototype.pieceMeal it extends
     * _.extend(obj.child.scope, obj.model);
     *
     * in scope we have childScope with model: {} and in obj.model we have model: undefined
     * then we will have undefined as a model and crashes.
     * For some reason it is not working this way anytime, because sometimes payload.updates is empty
     * and it works as expected but we should remove this undefined property to avoid this issues
     *
     * TODO: Remove this hot-fix when it is resolved inside angular-google-maps
     */


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


  /**
   * @typedef {Object} Map~GeoRegion
   * @property {Object} boundary Map bounds object
   * @property {Number} boundary.nw_lat North-West latitude
   * @property {Number} boundary.nw_lon North-West longitude
   * @property {Number} boundary.se_lat South-East latitude
   * @property {Number} boundary.se_lon South-East longitude
   */


  /**
   * @typedef {Object} Map~position
   * @property {*} latitude Latitude
   * @property {*} longitude Longitude
   */


  /**
   * @ngdoc service
   * @name pipMapComponent.pipMapHelperSrvProvider
   *
   * @description Helper for map. Contains methods to work with icons, map constants, etc.
   */
  function /*@ngInject*/ pipMapHelperSrv() {
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

    /**
     * @ngdoc method
     * @methodOf pipMapComponent.pipMapHelperSrvProvider
     * @name pipMapComponent.pipMapHelperSrvProvider#setIconSettings
     * @param {Object} sizes Object with new sizes
     * @param {number} [sizes.baseSize] Base icon size
     * @param {number} [sizes.normalFactor] Scale factor for normal icon state
     * @param {number} [sizes.activeFactor] Scale facor for active icon state
     * @param {number} [sizes.perSprite] ??
     *
     * @description Override service defaults
     */
    this.setIconSettings = function (sizes) {
      angular.extend(defaultIconParameters, sizes);
    };


    this.$get = (uiGmapGoogleMapApi, $timeout) => {
      /**
       * @ngdoc service
       * @name pipMapComponent.pipMapHelperSrv
       *
       * @description Helper for map. Contains methods to work with icons, map constants, etc.
       */
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


      /**
       * @ngdocs method
       * @methodOf pipMapComponent.pipMapHelperSrv
       * @name pipMapComponent.pipMapHelperSrv#getIconDimensions
       * @private
       *
       * @param {Object} icon Icon set dimensions to
       * @param {number} [icon.numberInSprite] Icon position in sprite
       * @param {boolean} [isActive = false] Whether to set active scale or normal
       *
       * @returns {Object} Icon dimensions
       * @see http://blog.mridey.com/2010/03/using-markerimage-in-maps-javascript.html for more details
       * Including method name
       * 1. It is used only in this service
       * 2. It seems to count position of an arrow near the icon, which shows it's movement direction
       */
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


      /**
       * @ngdocs method
       * @methodOf pipMapComponent.pipMapHelperSrv
       * @name pipMapComponent.pipMapHelperSrv#setIcon
       *
       * @param {Object} icon Icon to set position for
       * @param {boolean} [icon.isActive] True if icon currently is active
       * @param {number} [icon.numberInSprite] Icon position in sprite
       * @param {?boolean} isActive True if marker is active. If not boolean - it will leave old value of active
       *
       * @description Adds to an icon size properties
       */
      service.setIcon = function (icon, isActive) {
        isActive = typeof isActive === 'boolean' ? isActive : icon.isActive;

        service.whenReady.then(function () {
          var iconDimensions = this.getIconDimensions(icon, isActive);
          _.extend(icon, iconDimensions);
        }.bind(this));
      };


      /**
       * @ngdocs method
       * @methodOf pipMapComponent.pipMapHelperSrv
       * @name pipMapComponent.pipMapHelperSrv#triggerEvent
       *
       * @description Triggers event with provided arguments
       */
      service.triggerEvent = function () {
        var event = this.maps.event;

        if (!event) {
          return null;
        }

        return event.trigger.apply(event, arguments);
      };


      /**
       * @ngdocs method
       * @methodOf pipMapComponent.pipMapHelperSrv
       * @name pipMapComponent.pipMapHelperSrv#createSize
       * @param {number} width Width property for the size object
       * @param {number} height Height property for the size object
       * @returns {Object} New size instance or empty object
       *
       * @description Creates new size object of a given width and height in pixels
       */
      service.createSize = function (width, height) {
        var Size = this.maps.Size;

        if (!Size) {
          return {};
        }

        return new Size(width, height, 'px', 'px');
      };


      /**
       * @ngdocs method
       * @methodOf pipMapComponent.pipMapHelperSrv
       * @name pipMapComponent.pipMapHelperSrv#createPoint
       * @param {number} x X coordinate for the point object
       * @param {number} y Y coordinate for the point object
       * @returns {Object} New point instance or empty object
       *
       * @description Creates new point object of a given coordinates
       */
      service.createPoint = function (x, y) {
        var Point = this.maps.Point;

        if (!Point) {
          return {};
        }

        return new Point(x, y);
      };


      /**
       * @ngdocs method
       * @methodOf pipMapComponent.pipMapHelperSrv
       * @name pipMapComponent.pipMapHelperSrv#createPoint
       * @param {Object} options Settings for KML layer
       * @param {google.maps.Map} options.map Map instance to create kml layer for
       * @param {string} options.url Url of KML file
       *
       * @description Creates new point object of a given coordinates
       */
      service.createKML = function (options) {
        var Layer = this.maps.KmlLayer;

        if (!Layer) {
          return {};
        }

        return new Layer(options);
      };

      /**
       * @ngdoc method
       * @methodOf pipMapComponent.pipMapHelperSrv
       * @name pipMapComponent.pipMapHelperSrv#getCenterFromRegion
       *
       * @param {Map~GeoRegion} geoRegion - object with coordinates of map bounds. Has specific format.
       * @return {Map~position} Map center
       *
       * @description Get map center from geo region
       */
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


      /**
       * @ngdoc method
       * @methodOf pipMapComponent.pipMapHelperSrv
       * @name pipMapComponent.pipMapHelperSrv#fitMapToRegion
       *
       * @param {google.maps.Map} map Map to fit bounds
       * @param {Map~GeoRegion} geoRegion bounds
       * @link https://developers.google.com/maps/documentation/javascript/reference#LatLngBounds
       *
       * @description Fit map to specified geo region
       */
      service.fitMapToRegion = function (map, geoRegion) {
        var bounds = this.getBoundsFromRegion(geoRegion);

        // without timeout it sometimes is not working
        $timeout(this.forceMapToFitBounds.bind(this, map, bounds));
      };


      /**
       * @ngdoc method
       * @methodOf pipMapComponent.pipMapHelperSrv
       * @name pipMapComponent.pipMapHelperSrv#getBoundsFromRegion
       *
       * @param {Map~GeoRegion} geoRegion - object with coordinates of map bounds. Has specific format
       * @returns {google.maps.LatLngBounds|Object} New boundary or
       * empty object if no geoRegion is not provided or empty
       *
       * @description Get map bounds from geo region
       */
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


      /**
       * @ngdocs method
       * @methodOf pipMapComponent.pipMapHelperSrv
       * @name pipMapComponent.pipMapHelperSrv#getBoundsFromCoordinates
       *
       * @param {Array<Map~position>} coordinates Coordinates to get bounds from
       * @returns {google.maps.LatLngBounds|Object} Bounds fit coordinates
       *
       * @description Creates google bounds instance from given coordinates
       */
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


      /**
       * @ngdoc method
       * @methodOf pipMapComponent.pipMapHelperSrv
       * @name pipMapComponent.pipMapHelperSrv#fitMapToBounds
       *
       * @param {google.maps.Map} map Map to fit bounds
       * @param {google.maps.LatLngBounds} bounds bounds
       * @param {boolean} [force = false] force If true - forces setting of the bounds
       * @link https://developers.google.com/maps/documentation/javascript/reference#LatLngBounds
       *
       * @description Checks whether given bounds is larger then current
       * and fit map to specified bounds if so
       */
      service.fitMapToBounds = function (map, bounds, force) {
        if (bounds.isEmpty()) {
          return;
        }

        if (force || this.shouldFitBound(map, bounds)) {
          map.fitBounds(bounds);
        }
      };


      /**
       * @ngdoc method
       * @methodOf pipMapComponent.pipMapHelperSrv
       * @name pipMapComponent.pipMapHelperSrv#forceMapToFitBounds
       *
       * @param {google.maps.Map} map Map to fit bounds
       * @param {google.maps.LatLngBounds} bounds bounds
       * @link https://developers.google.com/maps/documentation/javascript/reference#LatLngBounds
       *
       * @description Fit map to specified bounds
       */
      service.forceMapToFitBounds = function (map, bounds) {
        this.fitMapToBounds(map, bounds, true);
      };


      /**
       * @ngdoc method
       * @methodOf pipMapComponent.pipMapHelperSrv
       * @name pipMapComponent.pipMapHelperSrv#shouldFitBound
       *
       * @param {google.maps.Map} map Map to fit bounds
       * @param {google.maps.LatLngBounds} bounds bounds
       *
       * @private
       * @description Checks if map should fit bounds
       */
      service.shouldFitBound = function (map, bounds) {
        var northEast = bounds.getNorthEast();
        var southWest = bounds.getSouthWest();

        var currentMapBounds = map.getBounds();
        var mapContainsBounds = currentMapBounds.contains &&
          (!currentMapBounds.contains(northEast) || !currentMapBounds.contains(southWest));

        return _.isEmpty(currentMapBounds) || mapContainsBounds;
      };


      /**
       * @ngdoc method
       * @methodOf pipMapComponent.pipMapHelperSrv
       * @name pipMapComponent.pipMapHelperSrv#setModelOptions
       *
       * @param {Object} pluralModel Plural model to set options for
       * @param {Object} [pluralModel.gObject] Google object
       * @param {Object} options New options
       *
       * @description Sets options for plural model if it is possible
       */
      service.setModelOptions = function (pluralModel, options) {
        var plainObject = pluralModel && pluralModel.gObject;

        if (plainObject && angular.isFunction(plainObject.setOptions)) {
          plainObject.setOptions(options);
        }
      };


      service.getDegreesBetweenTwoPoints = function (point1, point2) {
        let p1 = {
          lat: () => {
            return point1.lat || point1.latitude
          },
          lng: () => {
            return point1.lng || point1.longitude
          }
        };
        let p2 = {
          lat: () => {
            return point2.lat || point2.latitude
          },
          lng: () => {
            return point2.lng || point2.longitude
          }
        };

        return google.maps.geometry.spherical.computeHeading(p1, p2);
      }


      service.getDirection = function (point1, point2) {
        const degree = this.getDegreesBetweenTwoPoints(point1, point2);

          if (
            (point1.lat || point1.latitude) === (point2.lat || point2.latitude) &&
            (point1.lng || point1.longitude) === (point2.lng || point2.longitude)
          ) {
            return directions[8];
          }

        for (let i = 0; i < 8; i++) {
          if (degree >= directions[i].scope[0] && degree <= directions[i].scope[1]) {
            return directions[i];
          }
        }

        return directions[8];
      }

      service.getDirectionByAngle = function(degree) {
        for (let i = 0; i < 8; i++) {
          if (degree >= directions[i].scope[0] && degree <= directions[i].scope[1]) {
            return directions[i];
          }
        }

        return directions[8];
      }

      service.getIconOriginByDirection = function (point1, point2, iconSize: number = 82, gutter: number = 15) {
        const direction = this.getDirection(point1, point2);

        return new google.maps.Point(0, direction.numberInSprite * iconSize + direction.numberInSprite * gutter);
      }


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
    };
  }

  angular.module('pipMaps')
    .provider('pipMapHelperSrv', < any > pipMapHelperSrv)
    .decorator('uiGmapModelKey', uiGmapModelKeyDecorator);
})();