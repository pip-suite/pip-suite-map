(function () {
    'use strict';

    /**
     * @typedef {Object} Map~PopupBreakpoint
     * @property {string} name Name of the breakpoint (according to material docs)
     * @property {number} width Width of the offset
     * @property {number} height Height of the offset
     */
    /**
     * @ngdoc service
     * @name pipMapComponent.pipMapElementsFct
     * @restrict AE
     *
     * @scope
     * @property {Array<Object>} pipModels Models array
     * @property {Object} pipOptions Options for a map elements
     * @property {boolean} [pipOptions.fitBounds = true] Whether map fit bounds method should work
     * @property {boolean|Object} [pipOptions.popup = false] Popup for an element settings.
     * If set to false - popup is disabled
     * @property {string} [pipOptions.popup.className] Class name to add to a popup
     * @property {string} [pipOptions.popup.templateUrl] Template url for a popup
     * @property {Object} [pipOptions.popup.offset] Offset for a popup from current position
     * @property {number} [pipOptions.popup.width] Width of the offset
     * @property {number} [pipOptions.popup.height] Height of the offset
     * @property {Array.<Map~PopupBreakpoint>} [pipOptions.popup.breakpoints] Breakpoints to change offset for
     * Array is used for ability to prioritize them. If no breakpoint is matched - default offset is used
     *
     * @description
     * This is a template for a directive.
     * You SHOULD provide proper 'require', 'controller' and 'template' properties
     * Also you can decorate anything in it
     */
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
                            // fix issue with map zooming.
                            // We need timeout because map is fit bound on this call, but then it fits given zoom and bounds are lost
                            $timeout(mapCtrl.fitMapToBounds.bind(mapCtrl, bounds), 200);
                        });
                    }
                });

                $scope.$watch('ctrl.componentOptions.popup', (popupOptions) => {
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