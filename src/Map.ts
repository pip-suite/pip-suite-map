(() => {
  'use strict';
  USGSOverlay.prototype = new google.maps.OverlayView();

  /** @constructor */
  function USGSOverlay(bounds, image, map, opacity) {

    // Initialize all properties.
    this.bounds_ = bounds;
    this.image_ = image;
    this.map_ = map;

    this.opacity = opacity ? opacity : null;
    // Define a property to hold the image's div. We'll
    // actually create this div upon receipt of the onAdd()
    // method so we'll leave it null for now.
    this.div_ = null;

    // Explicitly call setMap on this overlay.
    this.setMap(map);
  }

  USGSOverlay.prototype.onAdd = function () {

    var div = document.createElement('div');
    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';
    if (this.opacity) div.style.opacity = this.opacity;

    // Create the img element and attach it to the div.
    var img = document.createElement('img');
    img.src = this.image_;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.position = 'absolute';
    div.appendChild(img);

    this.div_ = div;

    // Add the element to the "overlayLayer" pane.
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(div);
  };

  USGSOverlay.prototype.draw = function (bounds) {

    // We use the south-west and north-east
    // coordinates of the overlay to peg it to the correct position and size.
    // To do this, we need to retrieve the projection from the overlay.
    var overlayProjection = this.getProjection();
    if (!overlayProjection) return;

    // Retrieve the south-west and north-east coordinates of this overlay
    // in LatLngs and convert them to pixel coordinates.
    // We'll use these coordinates to resize the div.
    if (bounds) {
      this.bounds_ = bounds
    }
    var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());


    // Resize the image's div to fit the indicated dimensions.
    var div = this.div_;

    if (!div) return;

    // div.style.left = sw.x + 'px';
    // div.style.top = ne.y + 'px';
    // div.style.width = (ne.x - sw.x) + 'px';
    // div.style.height = (sw.y - ne.y) + 'px';
    div.style.left = sw.x + 'px';
    div.style.top = sw.y + 'px';
    div.style.width = (ne.x - sw.x) + 'px';
    div.style.height = (ne.y - sw.y) + 'px';
    if (this.opacity) div.style.opacity = this.opacity;
  };

  // The onRemove() method will be called automatically from the API if
  // we ever set the overlay's map property to 'null'.
  USGSOverlay.prototype.onRemove = function () {
    if (this.div_ && this.div_.parentNode) this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
  };

  /**
   * @ngdoc directive
   * @name pipMapComponent.pipMap
   * @restrict AE
   *
   * @scope
   * @property {Object} pipOptions Options for a map (including options for map provider)
   *
   * @property {Map~GeoRegion} pipOptions.geoRegion Geo region to set map center and bounds
   * @see https://developers.google.com/maps/documentation/javascript/reference#MapOptions
   * @property {Object} [pipOptions.map] Options for map provider
   * @property {boolean} [pipOptions.map.mapTypeId = satellite] Map view
   * @property {boolean} [pipOptions.map.disableDefaultUI = true] Disabling default UI controls
   * @property {boolean} [pipOptions.map.panControl = false] Allows pan control
   * @property {boolean} [pipOptions.map.zoomControl = false] Allows zoom control
   * @property {boolean} [pipOptions.setInitBounds = false] True if need to set bounds on init from geoRegion
   *
   * @property {Object} pipInstance Instance of the directive's controller to be able to use it's methods manually
   *
   * @description Directive to create map. It is an abstraction between a map provider and the framework
   * Also it provides methods with controller to zoom, fit map, etc
   */

  function MapComponentCtrl($injector, $scope, $element) {
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

    $scope.$watch('ctrl.componentOptions.center', (newVal) => {
      if (this.justResized == true) {
        //this.justResized = false;
        return;
      }

      if (this.gMap && newVal) {
        let newCenter = { lat: newVal.latitude || newVal.lat, lng: newVal.longitude || newVal.lng };

        if (_.isNumber(newCenter.lat) && _.isNumber(newCenter.lng)) {
          this.gMap.panTo(newCenter);
        }
      }
    }, true);

    $scope.$watch('ctrl.componentOptions.zoom', (newVal) => {
      if (this.map) this.map.zoom = newVal;
    });

    $scope.$watch('ctrl.componentOptions.embededMap', (newVal, oldVal) => {
      if (newVal && oldVal && newVal.embededSrc && oldVal.embededSrc && newVal.embededSrc == oldVal.embededSrc) {
        if (this.embededOverlay) {
          var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(newVal.map_north, newVal.map_west), new google.maps.LatLng(newVal.map_south, newVal.map_east));
          this.embededOverlay.draw(bounds)
          return;
        }
      }
      this.setEmbededBounds();
    });

    this.$rootScope.$on('pipMainResized', () => {
      //this.$timeout(this.updateMapTiles(true));
      this.throttleResize();
    });
  }


  /**
   * @ngdoc property
   * @propertyOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#defaultOptions
   * @type {{mapTypeId: *, disableDefaultUI: boolean, panControl: boolean, zoomControl: boolean}}
   *
   * @description Default map components
   */
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


  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#init
   *
   * @description Init map
   */
  MapComponentCtrl.prototype.init = function () {
    /**
     * @ngdoc property
     * @propertyOf pipMapComponent.MapComponentCtrl
     * @name pipMapComponent.MapComponentCtrl#componentOptions
     * @type {Object}
     *
     * @description Options from outer scope
     */
    this.options = angular.merge({
      map: {
        mapTypeId: this.pipMapHelperSrv.mapTypes.satellite
      }
    }, this.defaultOptions, this.componentOptions);

    if (!this.componentOptions.control) this.componentOptions.control = {};
    this.map = this.getMap();
    this.map.zoom = this.componentOptions.zoom;
    this.map.center = this.componentOptions.center;

    if (this.options.sidePanel && this.options.sidePanel.templateUrl) {
      this.showSidePanel(this.options.sidePanel.templateUrl);
    }

    this.uiGmapIsReady.promise()
      .finally(this.onMapReady.bind(this));
  };


  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#onMapReady
   *
   * @description On map ready handler
   */
  MapComponentCtrl.prototype.onMapReady = function () {
    this.setInitBounds();
    this.setEmbededBounds();
  };


  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#setInitBounds
   *
   * @description On map ready handler
   */
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
    } else {
      if (this.embededOverlay) this.embededOverlay.onRemove();
      this.embededOverlay = null;
    }
  };

  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#getMapInstance
   * @returns {google.maps.Map} Google map instance
   *
   * @protected
   * @description Returns Google map object
   */
  MapComponentCtrl.prototype.getMapInstance = function () {
    if (!this.gMap && this.componentOptions && this.componentOptions.control && this.componentOptions.control.getGMap) {
      this.gMap = this.componentOptions.control.getGMap();
    }

    return this.gMap;
  };


  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#getMap
   *
   * @link http://angular-ui.github.io/angular-google-maps/#!/api/google-map
   * @description Helper function to create new Angular Google Maps object.
   */
  MapComponentCtrl.prototype.getMap = function () {
    let externalClick = this.options.events && this.options.events.click ? this.options.events.click : angular.noop;
    let externalZoom = this.options.events && this.options.events.zoom_changed ? this.options.events.zoom_changed : angular.noop;
    let externalCenter = this.options.events && this.options.events.center_changed ? this.options.events.center_changed : angular.noop;
    var debounceCenterChange = _.debounce(function (event) {
      externalCenter(event);
    }, 500)
    // var debounceZoomChange = _.debounce(function (event) {
    //   externalZoom(event);
    // }, 50)
    return {
      control: {},
      options: this.options.map,
      bounds: this.options.bounds || {},
      events: _.extend(this.options.events, {
        click: (event) => {
          this.onClick(event);
          externalClick();
        },
        zoom_changed: (event) => {
          if (event && this.componentOptions && this.componentOptions.mapId) {
            event.mapId = this.componentOptions.mapId;
            externalZoom(event);
            // debounceZoomChange(event);
          }
        },
        center_changed: (event) => {
          if (event && this.componentOptions && this.componentOptions.mapId) {
            event.mapId = this.componentOptions.mapId;
            // externalCenter(event);
            debounceCenterChange(event);
          }
        },
        dblclick: this.onEventHandler.bind(this),
        tilesloaded: this.updateMapTiles.bind(this)
      })
    };
  };


  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#updateMapTiles
   *
   * @description Updates map tiles. It is fix for all problems related to not fully loaded tiles
   */
  MapComponentCtrl.prototype.updateMapTiles = function (updateCenter = false) {
    var gMap = this.getMapInstance();
    if (!gMap) return;
    this.pipMapHelperSrv.triggerEvent(gMap, 'resize'); // fix map is not fully loaded issue
  };

  var throttleUpdatingCenter = _.throttle((gMap, center) => {
    if (!center) return;

    gMap.panTo(center);
    gMap.setCenter(center);
  }, 400);

  MapComponentCtrl.prototype.throttleResize = function () {
    var gMap = this.getMapInstance();
    if (!gMap)
      return;
    if (this.justResized != true) {
      this.justResized = true;
      var center = gMap.getCenter();
      this.$timeout(() => {
        throttleUpdatingCenter(gMap, center);
      });
      this.$timeout(() => {
        this.justResized = false;
      }, 400)
    }

    this.pipMapHelperSrv.triggerEvent(gMap, 'resize');
  };

  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#fitMapToBounds
   *
   * @param {google.maps.LatLngBounds} bounds bounds
   * @link https://developers.google.com/maps/documentation/javascript/reference#LatLngBounds
   *
   * @description Fit map to specified bounds
   */
  MapComponentCtrl.prototype.fitMapToBounds = function (bounds) {
    this.pipMapHelperSrv.fitMapToBounds(this.getMapInstance(), bounds);
  };


  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#showSidePanel
   * @param {string} template Template url to pass to ng-include directive
   *
   * @description Shows side panel
   */
  MapComponentCtrl.prototype.showSidePanel = function (template) {
    this.sidePanel.template = template;
    this.sidePanel.show = true;
    this.$timeout(this.updateMapTiles.bind(this));
  };


  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#hideSidePanel
   *
   * @description Hides side panel
   */
  MapComponentCtrl.prototype.hideSidePanel = function () {
    this.sidePanel.template = null;
    this.sidePanel.show = false;
    this.$timeout(this.updateMapTiles.bind(this));
  };


  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#onClick
   *
   * @description On click default handler
   */
  MapComponentCtrl.prototype.onClick = function () {
    this.closePopup();
  };


  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#freeze
   *
   * @description Freezes map's pan and zoom with mouse
   */
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


  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#unfreeze
   *
   * @description Unfreezes map's pan and zoom with mouse
   */
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


  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#setCursor
   * @param {string} [cursor] Cursor code. If empty - the default behaviour is restored
   *
   * @description Overrides cursor for the map or set back default behaviour if cursor is not provided
   * @todo: I couldn't find any possibility to set a cursor for a map.
   * We can only set cursor for draggableMap and map dragging.
   * Also it is possible to set cursors for markers (not polys)
   */
  MapComponentCtrl.prototype.setCursor = function (cursor) {
    this.cursor = cursor;
  };


  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#setMapOptions
   * @param {google.maps.MapOptions} options Options to set
   *
   * @description Sets map options from given options object
   */
  MapComponentCtrl.prototype.setMapOptions = function (options) {
    var mapInstance = this.getMapInstance();
    mapInstance.setOptions(options);
  };


  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#createElementPopup
   * @param {Object} options Popup options
   * @returns {Object} Popup instance
   *
   * @description Creates popup instance and returns it
   */
  MapComponentCtrl.prototype.createElementPopup = function (options) {
    this.createPopupInstance();

    return this.popup.add(options);
  };


  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#createPopupInstance
   *
   * @description Creates popup instance
   */
  MapComponentCtrl.prototype.createPopupInstance = function () {
    if (this.popup) {
      return;
    }

    this.popup = this.MapPopupFct.create();
  };


  /**
   * @ngdoc method
   * @methodOf pipMapComponent.MapComponentCtrl
   * @name pipMapComponent.MapComponentCtrl#closePopup
   *
   * @description Closes popup
   */
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