(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name pipMapEditComponent.MapEditToolPolyFct
   * @constructor
   * @extends pipMapEditComponent.MapEditToolFct
   * @description Returns MapEditToolPolyFct
   */
  function MapEditToolPolyFct(MapEditToolFct) {
    /**
     * @ngdoc service
     * @name pipMapEditComponent.MapEditToolPolyFct
     * @param {Object} parameters Parameters for tool
     * @param {Object} parameters.options Options for tool
     * @param {Array<Object>} parameters.actions Actions instances for tool
     * @param {Object} parameters.controller Controller associated with the tool elements
     * @param {Array<number>} [parameters.actionsDisabledForExisting] Array of actions disabled for existing models
     *
     * @constructor
     * @description
     */
    function MapEditToolPolyFct(parameters) {
      MapEditToolFct.call(this, parameters);
    }

    var _super = MapEditToolFct.prototype;
    MapEditToolPolyFct.prototype = Object.create(_super);


    /**
     * @ngdoc property
     * @propertyOf pipMapEditComponent.MapEditToolPolyFct
     * @name pipMapEditComponent.MapEditToolPolyFct#defaultOptions
     * @type {Object}
     * @description
     */
    MapEditToolPolyFct.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {});


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditToolPolyFct
     * @name pipMapEditComponent.MapEditToolPolyFct#createModel
     * @returns {Object} New model
     *
     * @description Creates new model. Sets new positions array if needed
     */
    MapEditToolPolyFct.prototype.createModel = function () {
      var model = _super.createModel.call(this);

      this.ctrl.setDefaultPositionsIfNeeded(model);
      return model;
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditToolPolyFct
     * @name pipMapEditComponent.MapEditToolPolyFct#isCurrentModelNew
     * @returns {boolean} True if model is new or not existing
     *
     * @description Checks if current model is empty or not existing
     */
    MapEditToolPolyFct.prototype.isCurrentModelNew = function () {
      if (!this.currentModel) {
        return true;
      }

      var positions = this.ctrl.getPosition(this.currentModel);
      return !positions.length;
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditToolPolyFct
     * @name pipMapEditComponent.MapEditToolPolyFct#setEditOpacity
     *
     * @description Sets opacity for all available models except current
     */
    MapEditToolPolyFct.prototype.setEditOpacity = function () {
      this.setOptionsForNotCurrentModels({
        strokeOpacity: 0.4
      });
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditToolPolyFct
     * @name pipMapEditComponent.MapEditToolPolyFct#resetEditOpacity
     *
     * @description Resets opacity for all available models except current
     */
    MapEditToolPolyFct.prototype.resetEditOpacity = function () {
      this.setOptionsForNotCurrentModels({
        strokeOpacity: 1
      });
    };


    return MapEditToolPolyFct;
  }

  angular.module('pipMapsEdit')
    .factory('MapEditToolPolyFct', MapEditToolPolyFct);
})();