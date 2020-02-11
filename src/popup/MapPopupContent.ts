(() => {
  'use strict';

  /**
   * @ngdoc directive
   * @name pipMapComponent.mapPopupContent
   * @restrict AE
   *
   * @description Directive for basic popup content. Transcluded.
   */
  function mapPopupContent() {
    return {
      strict     : 'AE',
      transclude : true,
      templateUrl: 'popup/map-popup-content.html'
    };
  }

  angular.module('pipMapsPopup')
    .directive('pipMapPopupContent', mapPopupContent);
})();
