(function () {
  'use strict';

  function MapEditActionAddFct(MapEditActionFct) {
    /**
     * @ngdoc service
     * @name pipMapEditComponent.MapEditActionAddFct
     * @constructor
     * @extends pipMapEditComponent.MapEditActionFct
     *
     * @description Add action class
     */
    var MapEditActionAddFct = /*@ngInject*/function () {
    };


    var _super                    = MapEditActionFct.prototype;
    MapEditActionAddFct.prototype = Object.create(_super);


    /**
     * @ngdoc property
     * @propertyOf pipMapEditComponent.MapEditActionAddFct
     * @name pipMapEditComponent.MapEditActionAddFct#definition
     * @type {Object}
     *
     * @description Definition object
     */
    MapEditActionAddFct.prototype.definition = {
      mapEvents    : ['click'],
      elementEvents: [],
      name         : 'Add',
      icon         : 'map:point'
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditActionAddFct
     * @name pipMapEditComponent.MapEditActionAddFct#onMapClick
     * @param {MapEditToolFct~editObj} editObj Edit object
     * @param {Map~eventObj} eventObj Event object with all event data
     *
     * @description On map click event handler
     */
    MapEditActionAddFct.prototype.onMapClick = function (editObj, eventObj) {
      editObj.ctrl.setPosition(editObj.model, eventObj.position);
    };


    return MapEditActionAddFct;
  }

  angular.module('pipMapsEdit')
    .factory('MapEditActionAddFct', MapEditActionAddFct);
})();
