(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name pipMapComponent.pipMapPolylines
     * @restrict AE
     *
     * @scope
     * @property {Array<Object>} pipModels Polylines array
     * @property {Object} pipOptions Options for a map polylines
     *
     * @description  it extends pipMapElementsFct
     * @see pipMapComponent.pipMapElementsFct
     */

    function MapPolylinesCtrlFct(MapPolygonsCtrlFct) {
        /*@ngInject*/
        /**
         * @ngdoc Controller
         * @name pipMapComponent.MapPolylinesCtrl
         * @mixes pipMapComponent.mapEventHandlerMixinFct
         * @constructor
         * @extends pipMapComponent.MapPolygonsCtrl
         * @description Controller for a map polylines
         */
        function MapPolylinesCtrl($injector, $scope) {
            MapPolygonsCtrlFct.call(this, $injector, $scope);
        }


        var _super = MapPolygonsCtrlFct.prototype;
        MapPolylinesCtrl.prototype = Object.create(_super);


        /**
         * @ngdoc property
         * @propertyOf pipMapComponent.MapPolylinesCtrl
         * @name pipMapComponent.MapPolylinesCtrl#defaultOptions
         * @type {Object}
         * @description Default map components
         */
        MapPolylinesCtrl.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {});


        return MapPolylinesCtrl;
    }

    /**
     * Create controller
     */
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