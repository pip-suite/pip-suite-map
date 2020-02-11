(function () {
  'use strict';

  function MapEditActionAddPolyFct(MapEditActionFct) {
    /**
     * @ngdoc service
     * @name pipMapEditComponent.MapEditActionAddPolyFct
     * @constructor
     * @extends pipMapEditComponent.MapEditActionFct
     *
     * @description Add action class
     */
    var MapEditActionAddPolyFct = /*@ngInject*/function () {
    };

    var _super                        = MapEditActionFct.prototype;
    MapEditActionAddPolyFct.prototype = Object.create(_super);


    /**
     * @ngdoc property
     * @propertyOf pipMapEditComponent.MapEditActionAddPolyFct
     * @name pipMapEditComponent.MapEditActionAddPolyFct#definition
     * @type {Object}
     *
     * @description Definition object
     */
    MapEditActionAddPolyFct.prototype.definition = {
      mapEvents    : ['click'],
      elementEvents: [],
      name         : 'Add',
      icon         : 'map:pen'
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionAddPolyFct
     * @name pipMapEditComponent.MapEditActionAddPolyFct#init
     * @param {MapEditToolFct~editObj} editObj Edit object
     *
     * @description Init an action with edit object
     */
    MapEditActionAddPolyFct.prototype.init = function (editObj) {
      _super.init.call(this, editObj);

      this.setModelEditable(editObj);
      this.resetModelDraggable(editObj);
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionAddPolyFct
     * @name pipMapEditComponent.MapEditActionAddPolyFct#onMapClick
     * @param {MapEditToolFct~editObj} editObj Edit object
     * @param {Map~eventObj} eventObj Event object with all event data
     *
     * @description On map click event handler
     */
    MapEditActionAddPolyFct.prototype.onMapClick = function (editObj, eventObj) {
      var positions = this.getPosition(editObj);
      positions.push(eventObj.position);
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionAddPolyFct
     * @name pipMapEditComponent.MapEditActionAddPolyFct#onElementClick
     * @param {MapEditToolFct~editObj} editObj Edit object
     * @param {Map~eventObj} eventObj Event object with all event data
     *
     * @description On element click event handler - we should treat is a click on the map
     */
    MapEditActionAddPolyFct.prototype.onElementClick = function (editObj, eventObj) {
      this.onMapClick(editObj, eventObj);
    };


    return MapEditActionAddPolyFct;
  }

  angular.module('pipMapsEdit')
    .factory('MapEditActionAddPolyFct', MapEditActionAddPolyFct);
})();
