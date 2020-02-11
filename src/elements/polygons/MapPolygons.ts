(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name pipMapComponent.pipMapPolygons
     * @restrict AE
     *
     * @scope
     * @property {Array<Object>} pipModels Polygons array
     * @property {Object} pipOptions Options for a map polygons
     *
     * @description  it extends pipMapElementsFct
     * @see pipMapComponent.pipMapElementsFct
     */

    function MapPolygonsCtrlFct(MapElementsCtrlFct) {
        /*@ngInject*/
        /**
         * @ngdoc Controller
         * @name pipMapComponent.MapPolygonsCtrl
         * @mixes pipMapComponent.mapEventHandlerMixinFct
         * @constructor
         * @extends pipMapComponent.MapElementsCtrl
         *
         * @description Controller for a map polygons
         */
        function MapPolygonsCtrl($injector, $scope) {
            MapElementsCtrlFct.call(this, $injector, $scope);
            this.$parse = $injector.get('$parse');
        }


        var _super = MapElementsCtrlFct.prototype;
        MapPolygonsCtrl.prototype = Object.create(_super);


        /**
         * @ngdoc property
         * @propertyOf pipMapComponent.MapPolygonsCtrl
         * @name pipMapComponent.MapPolygonsCtrl#defaultOptions
         * @type {Object}
         *
         * @description Default map components
         */
        MapPolygonsCtrl.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {
            path: 'path',
            stroke: {
                color: '#ff6262',
                weight: 5
            },
            fitBounds: false
        });


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPolygonsCtrl
         * @name pipMapComponent.MapPolygonsCtrl#$onInit
         *
         * @description Init component
         */
        MapPolygonsCtrl.prototype.$onInit = function () {
            _super.$onInit.call(this);
            this.setPositionGetterSetter();
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPolygonsCtrl
         * @name pipMapComponent.MapPolygonsCtrl#setPositionGetterSetter
         *
         * @description Sets getter for coordinates or null if it not needed. Treats options.model.coords
         */
        MapPolygonsCtrl.prototype.setPositionGetterSetter = function () {
            var pathProp = this.options.path;

            this.getPosition = this.$parse(pathProp);
            this.setPosition = this.getPosition.assign;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPolygonsCtrl
         * @name pipMapComponent.MapPolygonsCtrl#setDefaultPositionsIfNeeded
         * @param {Object} model Marker to set position for
         *
         * @description Checks if current positions is empty and sets default if needed
         */
        MapPolygonsCtrl.prototype.setDefaultPositionsIfNeeded = function (model) {
            var positions = this.getPosition(model);

            if (!angular.isArray(positions)) {
                this.setPosition(model, []);
            }
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPolygonsCtrl
         * @name pipMapComponent.MapPolygonsCtrl#getAllPositions
         * @returns {Array<Object>} Positions for given model or an empty array
         *
         * @description Gets model positions array.
         */
        MapPolygonsCtrl.prototype.getAllPositions = function () {
            var paths = _super.getAllPositions.call(this);
            return Array.prototype.concat.apply([], paths); //flatten array of arrays
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPolygonsCtrl
         * @name pipMapComponent.MapPolygonsCtrl#setPosition
         * @param {Object} model Marker to set position for
         * @param {Array<Map~position>|<Map~position>} position Position to set
         *
         * @description Default maker position setter. We use it if coords is set to 'self'
         */
        MapPolygonsCtrl.prototype.setPosition = function (model, position) {
            model[this.defaultOptions.path] = position;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPolygonsCtrl
         * @name pipMapComponent.MapPolygonsCtrl#getPosition
         * @param {Object} model Marker to get position for
         * @returns {Array<Map~position>|<Map~position>} Position for a model
         *
         * @description Default polygon position getter. We use it if coords is set to 'self'
         */
        MapPolygonsCtrl.prototype.getPosition = function (model) {
            return model[this.defaultOptions.path];
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPolygonsCtrl
         * @name pipMapComponent.MapPolygonsCtrl#isModelEmpty
         * @param {Object} model Model to check position for
         * @returns {boolean} True if current model is empty
         *
         * @description Checks whether model is empty
         */
        MapPolygonsCtrl.prototype.isModelEmpty = function (model) {
            var position = this.getPosition(model);
            return !position || !position.length || !position[0].latitude || !position[0].longitude;
        };


        return MapPolygonsCtrl;
    }


    /**
     * Create controller
     */
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