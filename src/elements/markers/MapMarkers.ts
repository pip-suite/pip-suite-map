(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name pipMapComponent.pipMapMarkers
     * @restrict AE
     *
     * @scope
     * @property {Array<Object>} pipModels Markers array
     * @property {Object} pipOptions Options for a map markers
     * @property {boolean|Object} [pipOptions.connect = false] Connection lines settings
     * (connect markers or groups together). If set to false - connections are disabled
     * @property {Object} [pipOptions.connect.stroke] Settings for connections stroke
     * @property {Object} [pipOptions.connect.icons] Settings for connection icons
     * @property {Object} [pipOptions.connect.property] Settings for connection data
     * from which property it should take data to show connections.
     *
     * @description  it extends pipMapElementsFct
     * @see pipMapComponent.pipMapElementsFct
     */

    function MapMarkersCtrlFct(MapElementsCtrlFct) {
        /*@ngInject*/
        /**
         * @ngdoc Controller
         * @name pipMapComponent.MapMarkersCtrl
         * @mixes pipMapComponent.mapEventHandlerMixinFct
         * @constructor
         * @extends pipMapComponent.MapElementsCtrl
         *
         * @description Controller for a map marker
         */
        function MapMarkersCtrl($injector, $scope) {
            MapElementsCtrlFct.call(this, $injector, $scope);

            this.$parse = $injector.get('$parse');
            this.pipMapHelperSrv = $injector.get('pipMapHelperSrv');
        }


        var _super = MapElementsCtrlFct.prototype;
        MapMarkersCtrl.prototype = Object.create(_super);


        /**
         * @ngdoc property
         * @propertyOf pipMapComponent.MapMarkersCtrl
         * @name pipMapComponent.MapMarkersCtrl#defaultOptions
         * @type {Object}
         *
         * @description Default map components
         */
        MapMarkersCtrl.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {
            model: {
                coords: 'self',
                icon: 'icon'
            },
            connect: false
        });


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapMarkersCtrl
         * @name pipMapComponent.MapMarkersCtrl#$onInit
         *
         * @description Init component
         */
        MapMarkersCtrl.prototype.$onInit = function () {
            _super.$onInit.call(this);
            this.setPositionGetterSetter();
            this.initConnect();
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapMarkersCtrl
         * @name pipMapComponent.MapMarkersCtrl#initConnect
         *
         * @description Init polyline configuration for connections
         */
        MapMarkersCtrl.prototype.initConnect = function () {
            if (!this.options.connect) {
                return;
            }

            var options = this.options.connect;

            this.connect = angular.merge({
                show: true
            }, options);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapMarkersCtrl
         * @name pipMapComponent.MapMarkersCtrl#setPositionGetterSetter
         *
         * @description Sets getter for coordinates or null if it not needed. Treats options.model.coords
         */
        MapMarkersCtrl.prototype.setPositionGetterSetter = function () {
            var coordsProp = this.options.model.coords;

            if (coordsProp === 'self') { // take object with coordinates
                return;
            }

            this.getPosition = this.$parse(coordsProp);
            this.setPosition = this.getPosition.assign;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapMarkersCtrl
         * @name pipMapComponent.MapMarkersCtrl#setPosition
         * @param {Object} model Marker to set position for
         * @param {Array<Map~position>|<Map~position>} position Position to set
         *
         * @description Default maker position setter. We use it if coords is set to 'self'
         */
        MapMarkersCtrl.prototype.setPosition = function (model, position) {
            angular.extend(model, position);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapMarkersCtrl
         * @name pipMapComponent.MapMarkersCtrl#onShowPopup
         * @param {Object} model Model to which popup is shown
         *
         * @description Closes popup window and clears related data
         */
        MapMarkersCtrl.prototype.onShowPopup = function (model) {
            //this.resetIconActive();
            this.popUpOpened = model.id;
            if (!this.options.popup.options.setPosition) {
                return;
            }

            //this.setIconActive(model);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapMarkersCtrl
         * @name pipMapComponent.MapMarkersCtrl#onClosePopup
         *
         * @description Closes popup window and clears related data
         */
        MapMarkersCtrl.prototype.onClosePopup = function () {
            //this.resetIconActive();
            this.popUpOpened = null;
        };

        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapMarkersCtrl
         * @name pipMapComponent.MapMarkersCtrl#setIconActive
         * @param {Object} model Model to set icon for
         *
         * @description Sets icon for the marker active
         */
        MapMarkersCtrl.prototype.setIconActive = function (model) {
            if (!model || !model.icon) {
                return;
            }

            this.popupModel = model;
            this.pipMapHelperSrv.setIcon(this.popupModel.icon, true);
        };

        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapMarkersCtrl
         * @name pipMapComponent.MapMarkersCtrl#resetIconActive
         *
         * @description Sets icon for the marker inactive
         */
        MapMarkersCtrl.prototype.resetIconActive = function () {
            if (!this.popupModel || !this.popupModel.icon) {
                return;
            }

            this.pipMapHelperSrv.setIcon(this.popupModel.icon, false);
            this.popupModel = null;
        };

        return MapMarkersCtrl;
    }

    /**
     * Create controller
     */
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