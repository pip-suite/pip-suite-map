(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name pipMapEditComponent.MapEditUndoSrv
     *
     * @description Service for creation MapEditUndo
     */
    function MapEditUndoSrv() {
        /**
         * @ngdoc service
         * @name pipMapEditComponent.MapEditUndo
         * @constructs
         * @param {Object} object Object to put as first version
         *
         * @description Service for undo and cancel objects edition
         */
        var MapEditUndo = function (object) {
            this.history = [];
            this.write(object);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditUndo
         * @name pipMapEditComponent.MapEditUndo#write
         *
         * @param {Object} object The next version of the object to put to the history
         *
         * @description Writes the next version of the object ot the history
         */
        MapEditUndo.prototype.write = function (object) {
            this.history.push(angular.copy(object));
        };


        /**
         *  @ngdoc method
         * @methodOf pipMapEditComponent.MapEditUndo
         * @name pipMapEditComponent.MapEditUndo#
         *
         * @returns {Object} Previous version of the object
         *
         * @description Gets the previous version of the object from the history and returns it
         */
        MapEditUndo.prototype.undo = function () {
            return this.history.pop();
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditUndo
         * @name pipMapEditComponent.MapEditUndo#
         *
         * @returns {Object} First version of the object
         *
         * @description Cleans the history and returns the first version of the object
         */
        MapEditUndo.prototype.cancel = function () {
            var object = this.history[0];
            this.history = [object];

            return object;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapEditComponent.MapEditUndo
         * @name pipMapEditComponent.MapEditUndo#
         *
         * @description Finished edition - removes history
         */
        MapEditUndo.prototype.finish = function () {
            this.history = null;
        };


        return {
            /**
             * @ngdoc method
             * @methodOf pipMapEditComponent.MapEditUndoSrv
             * @name pipMapEditComponent.MapEditUndoSrv#create
             *
             * @param {Object} object Object to put as first version
             * @returns {pipMapEditComponent.MapEditUndo} Instance of undoer
             *
             * @description Creates instance of the undoer
             */
            create: function (object) {
                return new MapEditUndo(object);
            }
        };
    }

    angular.module('pipMapsEdit')
        .factory('MapEditUndoSrv', MapEditUndoSrv);
})();