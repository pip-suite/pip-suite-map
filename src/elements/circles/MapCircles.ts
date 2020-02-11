(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name pipMapComponent.pipMapCircles
     * @restrict AE
     *
     * @scope
     * @property {Array<Object>} pipModels Circles array
     * @property {Object} pipOptions Options for a map circles
     *
     * @description  it extends pipMapElementsFct
     * @see pipMapComponent.pipMapElementsFct
     */

    function MapCirclesCtrlFct(MapElementsCtrlFct) {
        /*@ngInject*/
        /**
         * @ngdoc Controller
         * @name pipMapComponent.MapCirclesCtrl
         * @mixes pipMapComponent.mapEventHandlerMixinFct
         * @constructor
         * @extends pipMapComponent.MapElementsCtrl
         *
         * @description Controller for a map circles
         */
        function MapCirclesCtrl($injector, $scope) {
            MapElementsCtrlFct.call(this, $injector, $scope);
            this.$parse = $injector.get('$parse');
        }


        var _super = MapElementsCtrlFct.prototype;
        MapCirclesCtrl.prototype = Object.create(_super);


        /**
         * @ngdoc property
         * @propertyOf pipMapComponent.MapCirclesCtrl
         * @name pipMapComponent.MapCirclesCtrl#defaultOptions
         * @type {Object}
         *
         * @description Default map components
         */
        MapCirclesCtrl.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {
            stroke: 'stroke',
            fill: 'fill',
            radius: 'radius',
            center: 'center',
            fitBounds: false
        });


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapCirclesCtrl
         * @name pipMapComponent.MapCirclesCtrl#$onInit
         *
         * @description Init component
         */
        MapCirclesCtrl.prototype.$onInit = function () {
            _super.$onInit.call(this);
            this.setPositionGetterSetter();
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapCirclesCtrl
         * @name pipMapComponent.MapCirclesCtrl#setPositionGetterSetter
         *
         * @description Sets getter for coordinates or null if it not needed. Treats options.model.coords
         */
        MapCirclesCtrl.prototype.setPositionGetterSetter = function () {
            var pathProp = this.options.path;

            this.getPosition = this.$parse(pathProp);
            this.setPosition = this.getPosition.assign;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapCirclesCtrl
         * @name pipMapComponent.MapCirclesCtrl#setDefaultPositionsIfNeeded
         * @param {Object} model Marker to set position for
         *
         * @description Checks if current positions is empty and sets default if needed
         */
        MapCirclesCtrl.prototype.setDefaultPositionsIfNeeded = function (model) {
            var positions = this.getPosition(model);

            if (!angular.isArray(positions)) {
                this.setPosition(model, []);
            }
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapCirclesCtrl
         * @name pipMapComponent.MapCirclesCtrl#getAllPositions
         * @returns {Array<Object>} Positions for given model or an empty array
         *
         * @description Gets model positions array.
         */
        MapCirclesCtrl.prototype.getAllPositions = function () {
            var paths = _super.getAllPositions.call(this);
            return Array.prototype.concat.apply([], paths); //flatten array of arrays
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapCirclesCtrl
         * @name pipMapComponent.MapCirclesCtrl#setPosition
         * @param {Object} model Marker to set position for
         * @param {Array<Map~position>|<Map~position>} position Position to set
         *
         * @description Default maker position setter. We use it if coords is set to 'self'
         */
        MapCirclesCtrl.prototype.setPosition = function (model, position) {
            model[this.defaultOptions.center] = position;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapCirclesCtrl
         * @name pipMapComponent.MapCirclesCtrl#getPosition
         * @param {Object} model Marker to get position for
         * @returns {Array<Map~position>|<Map~position>} Position for a model
         *
         * @description Default polygon position getter. We use it if coords is set to 'self'
         */
        MapCirclesCtrl.prototype.getPosition = function (model) {
            return model[this.defaultOptions.center];
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapCirclesCtrl
         * @name pipMapComponent.MapCirclesCtrl#isModelEmpty
         * @param {Object} model Model to check position for
         * @returns {boolean} True if current model is empty
         *
         * @description Checks whether model is empty
         */
        MapCirclesCtrl.prototype.isModelEmpty = function (model) {
            var position = this.getPosition(model);
            return !position;
        };


        return MapCirclesCtrl;
    }


    /**
     * Create controller
     */
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