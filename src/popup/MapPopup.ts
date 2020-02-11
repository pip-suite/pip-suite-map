(() => {
    'use strict';

    /**
     * @ngdoc directive
     * @name pipMapComponent.mapPopup
     * @restrict A
     *
     * @description Directive for popup for map elements. Also treats editable elements properly
     */
    function mapPopup() {
        return {
            strict: 'A',
            scope: {
                popup: '=pipMapPopup'
            },
            templateUrl: 'popup/map-popup.html'
        };
    }

    angular.module('pipMapsPopup')
        .directive('pipMapPopup', mapPopup);
})();