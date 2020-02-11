(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name pipMapComponent.mapElementsRequireFct
   *
   * @description Provide methods for requiring elements, detect there controllers and types
   */
  function mapElementsRequireFct() {
    return {
      /**
       * @ngdoc property
       * @propertyOf pipMapComponent.mapElementsRequireFct
       * @name pipMapComponent.mapElementsRequireFct#elements
       *
       * @type {Array<string>}
       */
      elements: ['?^pipMapMarkers', '?^pipMapPolylines', '?^pipMapPolygons', '?^pipMapKml'],


      /**
       * @ngdoc method
       * @methodOf pipMapComponent.mapElementsRequireFct
       * @name pipMapComponent.mapElementsRequireFct#getType
       *
       * @param {Array<Object>} $controllers Controllers instances which were required
       * @param {number} [startIndex = 0] Index to start searching from
       * @returns {string} Type of the element on which this directive is used
       *
       * @description Detects by controllers names element type on which this directive is being used
       */
      getType: function ($controllers, startIndex) {
        try {
          return $controllers.slice(startIndex)
            .map(function (ctrl, index) {
              return ctrl && this.elements[index];
            }, this)
            .filter(function (ctrlName) {
              return ctrlName;
            })[0]
            .replace('?^pipMap', '')
            .toLowerCase();
        } catch (e) {
          throw new Error('pip-map-editable-element can be used only with map elements directives');
        }
      },


      /**
       * @ngdoc method
       * @methodOf pipMapComponent.mapElementsRequireFct
       * @name pipMapComponent.mapElementsRequireFct#getController
       *
       * @param {Array<Object>} $controllers Controllers instances which were required
       * @param {number} [startIndex = 0] Index to start searching from
       * @returns {Object} Instance of the controller
       *
       * @description Returns element's controllers among other controllers instances
       */
      getController: function ($controllers, startIndex) {
        return $controllers.slice(startIndex)
          .filter(function (ctrl) {
            return ctrl;
          })[0];
      }
    };
  }

  angular.module('pipMapsElements')
    .factory('mapElementsRequireFct', mapElementsRequireFct);
})();
