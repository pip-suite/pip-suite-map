(function () {
    'use strict';

    function MapEditActionMoveFct(MapEditActionFct) {
        /**
         * @ngdoc service
         * @name pipMapEditComponent.MapEditActionMoveFct
         * @constructor
         * @extends pipMapEditComponent.MapEditActionFct
         *
         * @description Add action class
         */
        var MapEditActionMoveFct = /*@ngInject*/ function () {};


        var _super = MapEditActionFct.prototype;
        MapEditActionMoveFct.prototype = Object.create(_super);


        /**
         * @ngdoc property
         * @propertyOf pipMapEditComponent.MapEditActionMoveFct
         * @name pipMapEditComponent.MapEditActionMoveFct#definition
         * @type {Object}
         *
         * @description Definition object
         */
        MapEditActionMoveFct.prototype.definition = {
            mapEvents: ['click'],
            elementEvents: [],
            name: 'Move',
            icon: 'map:hand'
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditActionMoveFct
         * @name pipMapEditComponent.MapEditActionMoveFct#init
         * @param {MapEditToolFct~editObj} editObj Edit object
         *
         * @description Init an action with edit object
         */
        MapEditActionMoveFct.prototype.init = function (editObj) {
            _super.init.call(this, editObj);

            this.resetModelEditable(editObj);
            this.setModelDraggable(editObj);
        };


        return MapEditActionMoveFct;
    }

    angular.module('pipMapsEdit')
        .factory('MapEditActionMoveFct', MapEditActionMoveFct);
})();