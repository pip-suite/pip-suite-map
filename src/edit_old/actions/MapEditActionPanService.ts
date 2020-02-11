(function () {
    'use strict';

    function MapEditActionPanFct(MapEditActionFct) {
        /**
         * @ngdoc service
         * @name pipMapEditComponent.MapEditActionPanFct
         * @constructor
         * @extends pipMapEditComponent.MapEditActionFct
         *
         * @description Add action class
         */
        var MapEditActionPanFct = /*@ngInject*/ function () {};


        var _super = MapEditActionFct.prototype;
        MapEditActionPanFct.prototype = Object.create(_super);


        /**
         * @ngdoc property
         * @propertyOf pipMapEditComponent.MapEditActionPanFct
         * @name pipMapEditComponent.MapEditActionPanFct#definition
         * @type {Object}
         *
         * @description Definition object
         */
        MapEditActionPanFct.prototype.definition = {
            mapEvents: ['click'],
            elementEvents: [],
            name: 'Pan',
            icon: 'map:pan'
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditActionPanFct
         * @name pipMapEditComponent.MapEditActionPanFct#init
         * @param {MapEditToolFct~editObj} editObj Edit object
         *
         * @description Init an action with edit object
         */
        MapEditActionPanFct.prototype.init = function (editObj) {
            this.resetModelEditable(editObj);
            this.resetModelDraggable(editObj);
            editObj.ctrl.unfreezeMap();
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditActionPanFct
         * @name pipMapEditComponent.MapEditActionPanFct#finish
         * @param {MapEditToolFct~editObj} editObj Edit object
         *
         * @description  Finish an action
         */
        MapEditActionPanFct.prototype.finish = function (editObj) {
            this.resetModelEditable(editObj);
            this.resetModelDraggable(editObj);
        };


        return MapEditActionPanFct;
    }

    angular.module('pipMapsEdit')
        .factory('MapEditActionPanFct', MapEditActionPanFct);
})();