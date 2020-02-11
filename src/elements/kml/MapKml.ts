(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name pipMapComponent.pipMapKml
     * @restrict AE
     *
     * @scope
     * @property {Array<Object>} pipModels Kml array
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

    function MapKmlCtrlFct(MapElementsCtrlFct) {
        /*@ngInject*/
        /**
         * @ngdoc Controller
         * @name pipMapComponent.MapKmlCtrl
         * @mixes pipMapComponent.mapEventHandlerMixinFct
         * @constructor
         * @extends pipMapComponent.MapElementsCtrl
         *
         * @description Controller for a map KML
         */
        function MapKmlCtrl($injector, $scope) {
            MapElementsCtrlFct.call(this, $injector, $scope);

            this.pipMapHelperSrv = $injector.get('pipMapHelperSrv');
            this.existingModels = [];
        }


        var _super = MapElementsCtrlFct.prototype;
        MapKmlCtrl.prototype = Object.create(_super);


        /**
         * @ngdoc property
         * @propertyOf pipMapComponent.MapKmlCtrl
         * @name pipMapComponent.MapKmlCtrl#defaultOptions
         * @type {Object}
         *
         * @description Default map components
         */
        MapKmlCtrl.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {
            layer: {
                preserveViewport: true,
                suppressInfoWindows: true
            }
        });


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapKmlCtrl
         * @name pipMapComponent.MapKmlCtrl#getPopupParameters
         * @returns {Object} Parameters object
         *
         * @description Gets parameters object for a popup template
         * @todo: Check whether this code is actual after moving to one popup instance per map
         */
        MapKmlCtrl.prototype.getPopupParameters = function (): any {
            if (!this.popup.model) {
                return {};
            }

            return {
                model: this.popup.model,
                position: this.popup.position,
                meta: this.popup.model.instance.getMetadata()
            };
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapKmlCtrl
         * @name pipMapComponent.MapKmlCtrl#update
         *
         * @description Updates models
         */
        MapKmlCtrl.prototype.update = function () {
            this.pipMapHelperSrv.whenReady.then(function () {
                this.removeOldModels();
                this.addNewModels();
            }.bind(this));
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapKmlCtrl
         * @name pipMapComponent.MapKmlCtrl#removeOldModels
         *
         * @description Removes old models
         */
        MapKmlCtrl.prototype.removeOldModels = function () {
            this.getOldModels()
                .forEach(function (model) {
                    model.instance.setMap(null);
                    this.deRegisterModel(model);
                }, this);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapKmlCtrl
         * @name pipMapComponent.MapKmlCtrl#getOldModels
         * @returns {Array<Object>} Old models
         *
         * @description Returns old models
         */
        MapKmlCtrl.prototype.getOldModels = function () {
            var newUrls = this.models.map(function (model) {
                return model.url;
            });

            return this.existingModels
                .filter(function (model) {
                    return newUrls.indexOf(model.url) === -1;
                });
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapKmlCtrl
         * @name pipMapComponent.MapKmlCtrl#addNewModels
         *
         * @description Adds new models to the map models
         */
        MapKmlCtrl.prototype.addNewModels = function () {
            this.getNewModels()
                .forEach(function (model) {
                    var copy = angular.copy(model);
                    this.addModel(copy);
                    this.registerModel(copy);
                    this.addEvents(copy);
                }, this);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapKmlCtrl
         * @name pipMapComponent.MapKmlCtrl#getNewModels
         * @returns {Array<Object>} New models
         *
         * @description Returns array of models to add
         */
        MapKmlCtrl.prototype.getNewModels = function () {
            var existingUrls = this.existingModels.map(function (model) {
                return model.url;
            });

            return this.models
                .filter(function (model) {
                    return existingUrls.indexOf(model.url) === -1;
                });
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapKmlCtrl
         * @name pipMapComponent.MapKmlCtrl#addModel
         * @param {Object} model Model to add
         *
         * @description Adds a model to the map
         */
        MapKmlCtrl.prototype.addModel = function (model) {
            var mapInstance = this.mapCtrl.getMapInstance();
            var options = angular.merge({
                map: mapInstance,
                url: model.url
            }, this.options.layer);

            model.instance = this.pipMapHelperSrv.createKML(options);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapKmlCtrl
         * @name pipMapComponent.MapKmlCtrl#addEvents
         * @param {Object} model Model to add
         * @param {Object} model.instance Instance of the model's map element
         *
         * @description Adds events to a model
         */
        MapKmlCtrl.prototype.addEvents = function (model) {
            var clickHandler = this.onEvent.bind(this, model, 'click');
            model.instance.addListener('click', clickHandler);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapKmlCtrl
         * @name pipMapComponent.MapKmlCtrl#onEvent
         * @param {Object} model Model to add
         * @param {Object} model.instance Instance of the model's map element
         * @param {string} name Event name
         *
         * @description Event handler - adapter between mixin's handler and native events
         */
        MapKmlCtrl.prototype.onEvent = function (model, name) {
            var args = this.copyArguments(arguments, 2);
            this.onEventHandler(model.instance, name, model, args);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapKmlCtrl
         * @name pipMapComponent.MapKmlCtrl#copyArguments
         *
         * @param {Arguments} args Arguments array
         * @param {number} startIndex Starting index for copying
         * @return {Array} Copied arguments
         *
         * @description Copies arguments into an array.
         * @see https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
         */
        MapKmlCtrl.prototype.copyArguments = function (args, startIndex) {
            var result = [];

            for (var i = 0; i < args.length - startIndex; ++i) {
                result[i] = args[i + startIndex];
            }

            return result;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapKmlCtrl
         * @name pipMapComponent.MapKmlCtrl#getPopupMetaData
         * @returns {?Object} Metadata for current model in popup
         *
         * @description Returns metadata
         * @todo: Check whether this code is actual after moving to one popup instance per map
         */
        MapKmlCtrl.prototype.getPopupMetaData = function () {
            return this.popup.model && this.popup.model.instance.getMetadata();
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapKmlCtrl
         * @name pipMapComponent.MapKmlCtrl#registerModel
         * @param {Object} model Model to register
         *
         * @description Registers model as existing
         */
        MapKmlCtrl.prototype.registerModel = function (model) {
            this.existingModels.push(model);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapKmlCtrl
         * @name pipMapComponent.MapKmlCtrl#deRegisterModel
         * @param {Object} model Model to de-register
         *
         * @description De-registers model as existing
         */
        MapKmlCtrl.prototype.deRegisterModel = function (model) {
            var index = this.existingModels.indexOf(model);
            this.existingModels.splice(index, 1);
        };


        return MapKmlCtrl;
    }


    /**
     * Create controller
     */
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