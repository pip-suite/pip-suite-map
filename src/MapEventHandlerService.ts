
(() => {
  'use strict';

  /**
   * @typedef {Object} Map~eventObj
   * @property {Object} gModel Google native model passed to event handler
   * @property {string} eventName Event name
   * @property {Array} args Arguments passed to the original handler
   * @property {Object} [model] Model related to an element, fired an event
   * @property {Object} [position] Clicked position coordinates
   * @property {Object} [position.latitude] Clicked position latitude
   * @property {Object} [position.longitude] Clicked position longitude
   */


  /**
   * @ngdoc service
   * @name pipMapComponent.mapEventHandlerMixinFct
   * @description Provides methods for types conversion
   * @mixin
   */
  function mapEventHandlerMixinFct() {
    /**
     *  @param {Object} gModel Google element class instance
     * @param {string} eventName Fired event name
     * @param {Object|Array} model Element model (settings object like we create here) or 'args'
     * @param {Array} [args] Arguments passed to google native handler
     * @returns {Map~eventObj}
     *
     * @private
     * @description Creates event object from arguments
     * Can be used for both map and model clickers
     */

    var createEventObjFromHandlerArguments = function (gModel, eventName, model, args) {
      if (!args || !args.length) {
        args  = model;
        model = null;
      }

      var position = args[0] && args[0].latLng && getPositionFromLatLng(args[0].latLng);

      return {
        gModel   : gModel,
        eventName: eventName,
        args     : args,
        model    : model,
        position : position
      };
    };

    /**
     * @param {Object} latLng Google longitude-latitude class instance
     * @returns {Map~position}
     *
     * @private
     * @description Gets latitude and longitude from latLng instance
     */
    var getPositionFromLatLng = function (latLng) {
      return {
        latitude : latLng.lat(),
        longitude: latLng.lng()
      };
    };


    var mixin = function (postHandler) {
      postHandler = postHandler || angular.noop;

      return {
        /**
         * @ngdoc method
         * @methodOf pipMapComponent.mapEventHandlerMixinFct
         * @name pipMapComponent.mapEventHandlerMixinFct#addEventHandler
         * @param {string} eventName Event name
         * @param {Function} callback Callback to call
         *
         * @returns {Function} Remove handler method
         * @description Add event handler for given event name
         */
        addEventHandler: function (eventName, callback) {
          var handlerName   = '__onEventOverridden_' + eventName;
          this[handlerName] = callback;

          return function () {
            this[handlerName] = null;
          }.bind(this);
        },

        /**
         * @ngdoc method
         * @methodOf pipMapComponent.mapEventHandlerMixinFct
         * @name pipMapComponent.mapEventHandlerMixinFct#onEventHandler
         * @param {Object} gObject Google map class instance
         * @param {string} eventName Fired event name
         * @param {Object|Array} args Model on which event was fired or args
         * @param {Array} [model] Arguments passed to google native handler
         *
         * @description Event handler
         */
        onEventHandler: function (gObject, eventName) {
          var handlerName = '__onEventOverridden_' + eventName;
          var eventObj    = createEventObjFromHandlerArguments.apply(null, arguments);

          if (angular.isFunction(this[handlerName])) {
            this[handlerName](eventObj);
            postHandler();

            return;
          }

          var defaultHandlerName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);

          if (angular.isFunction(this[defaultHandlerName])) {
            this[defaultHandlerName](eventObj);
            postHandler();
          }
        }
      };
    };

    return {
      mixTo: function (obj, $scope) {
        angular.extend(obj, mixin($scope));
      }
    };
  }

  angular.module('pipMaps')
    .factory('mapEventHandlerMixinFct', mapEventHandlerMixinFct);
})();
