(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name pipMapEditComponent.pipMapEditableElement
     * @restrict A
     *
     * @property {Object} pipOptions Options for a map elements
     * @property {?Object} [pipOptions.edit] Options for edition. If not provided - edition will be disabled
     * @see map-edit.controller
     * @property {string} [pipOptions.edit.template] Template for edition panel. Is pasted inside side panel
     * @property {string} [pipOptions.edit.toolsListTemplate] Template for tools list
     * @property {string} [pipOptions.edit.toolTemplate] Template for a tool panel
     *
     * @see map-edit-tool.service
     * @property {string} [pipOptions.edit.name = Edit tool]
     * Name of the element. Is shown in tools panel and in according tool
     * @property {string} [pipOptions.edit.icon = 'plus-circle'] Icon name for md-svg-icon
     * @property {string} [pipOptions.edit.titleProp = 'name'] Property from which title on the model is get
     * @property {Function} [pipOptions.edit.onSave] Callback to call on model save
     * @property {Object} [pipOptions.edit.baseModel] Base model. Is used for creation new models
     * @property {Object} [pipOptions.edit.baseModel.geodesic = false] Geodesic property
     *
     * @description Directive to create map. It is an abstraction between a map provider and the framework
     * Also it provides methods with controller to zoom, fit map, etc
     * It requires controllers for map, mapEdit and this element.
     * Also it requires one of the element controllers, detects it's type and gets it's controller
     */

    function MapEditableElementCtrl(mapEditToolsFct) {
    this.mapEditToolsFct = mapEditToolsFct;

    /**
     * @ngdoc property
     * @propertyOf pipMapEditComponent.MapEditableElementCtrl
     * @name pipMapEditComponent.MapEditableElementCtrl#options
     * @type {Object}
     * @description Options
     */
  }


  /**
   * @ngdoc method
   * @methodOf pipMapEditComponent.MapEditableElementCtrl
   * @name pipMapEditComponent.MapEditableElementCtrl#init
   *
   * @param {Object} mapEditCtrl Map edit controller instance
   * @param {Object} mapElementCtrl Map element controller instance
   * @param {string} type Type of the element
   *
   * @description Init editable element
   */
  MapEditableElementCtrl.prototype.init = function (mapEditCtrl, mapElementCtrl, type) {
    if (!this.options.edit) {
      return;
    }

    var toolCreator = this.mapEditToolsFct[type];

    if (!angular.isFunction(toolCreator)) {
      return;
    }

    mapEditCtrl.registerElement(mapElementCtrl, toolCreator(this.options.edit, mapElementCtrl));
  };

    function pipMapEditableElement(mapElementsRequireFct) {
        var mapComponents = ['^pipMap', '^pipMapEdit', 'pipMapEditableElement'];
        var start = mapComponents.length;

        return {
            strict: 'A',
            require: mapComponents.concat(mapElementsRequireFct.elements),
            link: function ($scope, $element, $attr, $controllers) {
                var mapEditCtrl = $controllers[1];
                var mapEditableCtrl = $controllers[2];

                var elementType = mapElementsRequireFct.getType($controllers, start);
                var elementCtrl = mapElementsRequireFct.getController($controllers, start);

                mapEditableCtrl.init(mapEditCtrl, elementCtrl, elementType);
            },

            bindToController: {
                options: '=pipOptions'
            },
            controller: 'MapEditableElementCtrl',
            controllerAs: 'editCtrl'
        };
    }

    angular.module('pipMapsEditableElement', [])
        .controller('MapEditableElementCtrl', MapEditableElementCtrl)
        .directive('pipMapEditableElement', pipMapEditableElement);
})();