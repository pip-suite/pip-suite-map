(function () {
    'use strict';

    function MapEditActionRemovePolyFct(MapEditActionFct) {
        /**
         * @ngdoc service
         * @name pipMapEditComponent.MapEditActionRemovePolyFct
         * @constructor
         * @extends pipMapEditComponent.MapEditActionFct
         *
         * @description Add action class
         */
        var MapEditActionRemovePolyFct = /*@ngInject*/ function () {};


        var _super = MapEditActionFct.prototype;
        MapEditActionRemovePolyFct.prototype = Object.create(_super);


        /**
         * @ngdoc property
         * @propertyOf pipMapEditComponent.MapEditActionRemovePolyFct
         * @name pipMapEditComponent.MapEditActionRemovePolyFct#definition
         * @type {Object}
         *
         * @description Definition object
         */
        MapEditActionRemovePolyFct.prototype.definition = {
            mapEvents: ['click'],
            elementEvents: [],
            name: 'Delete',
            icon: 'map:remove-point'
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditActionRemovePolyFct
         * @name pipMapEditComponent.MapEditActionRemovePolyFct#init
         * @param {MapEditToolFct~editObj} editObj Edit object
         *
         * @description Init an action with edit object
         */
        MapEditActionRemovePolyFct.prototype.init = function (editObj) {
            _super.init.call(this, editObj);

            this.setModelEditable(editObj);
            this.resetModelDraggable(editObj);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditActionRemovePolyFct
         * @name pipMapEditComponent.MapEditActionRemovePolyFct#onMapClick
         *
         * @description On map click event handler
         */
        MapEditActionRemovePolyFct.prototype.onMapClick = function () {};


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditActionRemovePolyFct
         * @name pipMapEditComponent.MapEditActionRemovePolyFct#onElementClick
         * @param {MapEditToolFct~editObj} editObj Edit object
         * @param {Map~eventObj} eventObj Event object with all event data
         *
         * @description On element click event handler
         */
        MapEditActionRemovePolyFct.prototype.onElementClick = function (editObj, eventObj) {
            var vertex = eventObj.args[0].vertex;

            if (typeof vertex === 'number') {
                eventObj.gModel.getPath().removeAt(vertex);
            }

            // This is hack to prevent editable state to be reset
            //eventObj.model.editable = true;
        };


        return MapEditActionRemovePolyFct;
    }

    angular.module('pipMapsEdit')
        .factory('MapEditActionRemovePolyFct', MapEditActionRemovePolyFct);
})();