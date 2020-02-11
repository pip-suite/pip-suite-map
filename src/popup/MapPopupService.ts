(() => {
    'use strict';

    function MapPopupFct($injector) {
        var MapElementPopup = $injector.get('MapElementPopupFct');
        var $rootScope = $injector.get('$rootScope');
        var $timeout = $injector.get('$timeout');

        /**
         * @ngdoc service
         * @name pipMapComponent.MapPopupFct
         *
         * @description Controller for popup for map elements directive
         */
        function MapPopupFct() {
            this.elements = [];
        }

        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPopupFct
         * @name pipMapComponent.MapPopupFct#add
         *
         * @param {Object} options Popup options
         * @returns {Object}
         *
         * @description Init popup configuration
         */
        MapPopupFct.prototype.add = function (options) {
            var element = MapElementPopup.create(options);
            this.elements.push(element);

            return {
                toggle: this.toggle.bind(this, element),
                close: this.close.bind(this, element),
                setPosition: (position) => {
                    if (this.element.options.updatePosition === false) return;

                    this.position = position;
                },
                setNewOptions: (options) => {
                    element.setNewOptions(options);
                }
            };
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPopupFct
         * @name pipMapComponent.MapPopupFct#toggle
         *
         * @param {pipMapComponent.MapElementPopupFct} element Element popup to show
         * @param {Map~eventObj} eventObj Event object for popup
         *
         * @description Toggles popup
         */
        MapPopupFct.prototype.toggle = function (element, eventObj) {
            if (this.isNewModel(eventObj)) {
                // if (this.element !== element) {
                this.close();

                this.element = element;
                $timeout(function () {
                    this.show(element);
                }.bind(this), 10); //magic number to let info-popup-window to be destroyed and init once again
                // }

                this.setPosition(eventObj);
                return;
            }

            this.close();
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPopupFct
         * @name pipMapComponent.MapPopupFct#isNewModel
         *
         * @param {Map~eventObj} eventObj Event object for popup
         * @returns {boolean} true if new
         *
         * @description Checks whether this is new popup to show
         */
        MapPopupFct.prototype.isNewModel = function (eventObj) {
            return this.model !== eventObj.model;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPopupFct
         * @name pipMapComponent.MapPopupFct#show
         *
         * @param {pipMapComponent.MapElementPopupFct} element Element popup to show
         *
         * @description Shows popup for an element with given event object
         */
        MapPopupFct.prototype.show = function (element) {
            if (!this.model || !this.position) {
                return;
            }

            this.isEnabled = true;

            this.setBreakpointHandler(element);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPopupFct
         * @name pipMapComponent.MapPopupFct#setPosition
         *
         * @param {Map~eventObj} eventObj Event for showing popup
         *
         * @description Closes popup window and clears related data
         */
        MapPopupFct.prototype.setPosition = function (eventObj) {
            this.position = this.getPosition(eventObj);
            this.model = eventObj.model;
            this.element.show(this.model);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPopupFct
         * @name pipMapComponent.MapPopupFct#setBreakpointHandler
         * @param {pipMapComponent.MapElementPopupFct} element Element popup to show
         *
         * @description Sets breakpoint handler
         */
        MapPopupFct.prototype.setBreakpointHandler = function (element) {
            this.removeBreakpointHandler = $rootScope.$on('pipMainLayoutResized', element.setPosition.bind(element));
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPopupFct
         * @name pipMapComponent.MapPopupFct#resetBreakpointHandler
         *
         * @description Resets breakpoint handler
         */
        MapPopupFct.prototype.resetBreakpointHandler = function () {
            if (this.removeBreakpointHandler) this.removeBreakpointHandler();
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPopupFct
         * @name pipMapComponent.MapPopupFct#close
         *
         * @description Closes popup window and clears related data
         */
        MapPopupFct.prototype.close = function () {
            if (!this.element) {
                return;
            }

            this.element.close();

            this.resetBreakpointHandler();

            this.model = null;
            this.isEnabled = false;
            this.position = null;
            this.element = null;
        };

        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapPopupFct
         * @name pipMapComponent.MapPopupFct#getPosition
         * @private
         *
         * @param {Map~eventObj} eventObj Event for showing popup
         *
         * @description Gets position for a popup
         */
        MapPopupFct.prototype.getPosition = function (eventObj) {
            return eventObj.position;
        };


        return {
            /**
             * @ngdoc method
             * @methodOf pipMapComponent.MapPopupFct
             * @name pipMapComponent.MapPopupFct#create
             * @returns {pipMapComponent.MapPopupFct} Popup service instance
             *
             * @static
             * @description Creates popup service instance
             */
            create: function () {
                return new MapPopupFct();
            }
        };
    }

    angular.module('pipMapsPopup')
        .factory('MapPopupFct', MapPopupFct);
})();