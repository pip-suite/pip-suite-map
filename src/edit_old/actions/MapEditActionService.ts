(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name pipMapEditComponent.MapEditActionFct
   * @constructor
   *
   * @description Abstract edit action class to be inherited by all actions for all tools
   */
  function /*@ngInject*/MapEditActionFct(pipMapHelperSrv) {
    var MapEditActionFct = function () {
    };


    /**
     * @ngdoc property
     * @propertyOf pipMapEditComponent.MapEditActionFct
     * @name pipMapEditComponent.MapEditActionFct#definition
     * @type {Object}
     *
     * @protected
     * @description Definition object
     */
    MapEditActionFct.prototype.definition = {
      mapEvents    : ['click'],
      elementEvents: ['click'],
      name         : 'Action',
      icon         : 'system'
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionFct
     * @name pipMapEditComponent.MapEditActionFct#init
     * @param {MapEditToolFct~editObj} editObj Edit object
     *
     * @abstract
     * @description Init an action with edit object
     */
    MapEditActionFct.prototype.init = function (editObj) {
      editObj.ctrl.freezeMap();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionFct
     * @name pipMapEditComponent.MapEditActionFct#finish
     * @param {MapEditToolFct~editObj} editObj Edit object
     *
     * @description Finish an action
     */
    MapEditActionFct.prototype.finish = function (editObj) {
      this.resetModelEditable(editObj);
      this.resetModelDraggable(editObj);
      editObj.ctrl.unfreezeMap();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionFct
     * @name pipMapEditComponent.MapEditActionFct#onMapClick
     * @param {MapEditToolFct~editObj} editObj Edit object
     * @param {Map~eventObj} eventObj Event object with all event data
     *
     * @abstract
     * @description On map click event handler
     */
    MapEditActionFct.prototype.onMapClick = function () {
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionFct
     * @name pipMapEditComponent.MapEditActionFct#onElementClick
     * @param {MapEditToolFct~editObj} editObj Edit object
     * @param {Map~eventObj} eventObj Event object with all event data
     *
     * @abstract
     * @description On element click event handler
     */
    MapEditActionFct.prototype.onElementClick = function () {
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionFct
     * @name pipMapEditComponent.MapEditActionFct#setModelEditable
     * @param {MapEditToolFct~editObj} editObj Edit object
     *
     * @protected
     * @description Set's model editable property to true
     */
    MapEditActionFct.prototype.setModelEditable = function (editObj) {
      this.setModelProperty(editObj, 'editable', true);
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionFct
     * @name pipMapEditComponent.MapEditActionFct#resetModelEditable
     * @param {MapEditToolFct~editObj} editObj Edit object
     *
     * @protected
     * @description Set's model editable property to false
     */
    MapEditActionFct.prototype.resetModelEditable = function (editObj) {
      this.setModelProperty(editObj, 'editable', false);
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionFct
     * @name pipMapEditComponent.MapEditActionFct#setModelDraggable
     * @param {MapEditToolFct~editObj} editObj Edit object
     *
     * @protected
     * @description Set's model draggable property to true
     */
    MapEditActionFct.prototype.setModelDraggable = function (editObj) {
      this.setModelProperty(editObj, 'draggable', true);
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionFct
     * @name pipMapEditComponent.MapEditActionFct#resetModelDraggable
     * @param {MapEditToolFct~editObj} editObj Edit object
     *
     * @protected
     * @description Set's model draggable property to false
     */
    MapEditActionFct.prototype.resetModelDraggable = function (editObj) {
      this.setModelProperty(editObj, 'draggable', false);
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionFct
     * @name pipMapEditComponent.MapEditActionFct#setModelProperty
     * @param {MapEditToolFct~editObj} editObj Edit object
     * @param {string} name Name of the property to set
     * @param {*} value Value to set to the property
     *
     * @protected
     * @description Sets model's property with given name to given value
     */
    MapEditActionFct.prototype.setModelProperty = function (editObj, name, value) {
      var plural    = this.getPlural(editObj);
      var options   = {};
      options[name] = value;

      pipMapHelperSrv.setModelOptions(plural, options);

      editObj.model[name] = value;
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionFct
     * @name pipMapEditComponent.MapEditActionFct#getPlural
     * @param {MapEditToolFct~editObj} editObj Edit object
     * @returns {Object} Plural object for given model
     *
     * @protected
     * @description Get plural for model
     */
    MapEditActionFct.prototype.getPlural = function (editObj) {
      return editObj.ctrl.getPlural(editObj.model.id);
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionFct
     * @name pipMapEditComponent.MapEditActionFct#getPosition
     * @param {MapEditToolFct~editObj} editObj Edit object
     * @returns {Object|Array<Object>} Position for given model
     *
     * @protected
     * @description Get position for model
     */
    MapEditActionFct.prototype.getPosition = function (editObj) {
      return editObj.ctrl.getPosition(editObj.model);
    };


    return MapEditActionFct;
  }

  angular.module('pipMapsEdit')
    .factory('MapEditActionFct', MapEditActionFct);
})();
