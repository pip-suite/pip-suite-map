(function () {
  'use strict';

  function MapEditActionEditPolyFct(MapEditActionFct) {
    /**
     * @ngdoc service
     * @name pipMapEditComponent.MapEditActionEditPolyFct
     * @constructor
     * @extends pipMapEditComponent.MapEditActionFct
     *
     * @description Add action class
     */
    var MapEditActionEditPolyFct = /*@ngInject*/function () {
    };


    var _super                         = MapEditActionFct.prototype;
    MapEditActionEditPolyFct.prototype = Object.create(_super);


    /**
     * @ngdoc property
     * @propertyOf pipMapEditComponent.MapEditActionEditPolyFct
     * @name pipMapEditComponent.MapEditActionEditPolyFct#definition
     * @type {Object}
     *
     * @description Definition object
     */
    MapEditActionEditPolyFct.prototype.definition = {
      mapEvents    : ['click'],
      elementEvents: [],
      name         : 'Edit',
      icon         : 'map:select'
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionEditPolyFct
     * @name pipMapEditComponent.MapEditActionEditPolyFct#init
     * @param {MapEditToolFct~editObj} editObj Edit object
     *
     * @description Init an action with edit object
     */
    MapEditActionEditPolyFct.prototype.init = function (editObj) {
      _super.init.call(this, editObj);

      this.setModelEditable(editObj);
      this.resetModelDraggable(editObj);
    };


    return MapEditActionEditPolyFct;
  }

  angular.module('pipMapsEdit')
    .factory('MapEditActionEditPolyFct', MapEditActionEditPolyFct);
})();
