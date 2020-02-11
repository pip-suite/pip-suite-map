(function () {
    'use strict';

    function MapElementsCtrlFct() {
        /*@ngInject*/
        /**
         * @ngdoc Controller
         * @name pipMapComponent.MapElementsCtrl
         * @mixes pipMapComponent.mapEventHandlerMixinFct
         * @constructor
         *
         * @description Controller for a map component (directive)
         */
        function MapElementsCtrl($injector, $scope) {
            var mapEventHandlerMixinFct = $injector.get('mapEventHandlerMixinFct');
            mapEventHandlerMixinFct.mixTo(this, $scope.$applyAsync.bind($scope));

            this.control = {};
            this.popUpOpened = null;
            this.pipMapHelperSrv = $injector.get('pipMapHelperSrv');
            this.uiGmapIsReady = $injector.get('uiGmapIsReady');
            this.$q = $injector.get('$q');
        }


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#$onInit
         *
         * @description Init component
         */
        MapElementsCtrl.prototype.$onInit = function () {
            /**
             * @ngdoc property
             * @propertyOf pipMapComponent.MapElementsCtrl
             * @name pipMapComponent.MapElementsCtrl#componentOptions
             * @type {Object}
             *
             * @description Options from outer scope
             */
            this.options = angular.merge({}, this.defaultOptions, this.componentOptions);
            this.models = this.models || [];

            this.externalDblclick = this.options.events && this.options.events.dblclick ? this.options.events.dblclick : angular.noop;
            this.externalClick = this.options.events && this.options.events.click ? this.options.events.click : angular.noop;
            this.externalRightclick = this.options.events && this.options.events.rightclick ? this.options.events.rightclick : angular.noop;

            this.events = _.extend(this.options.events,
                {
                    dblclick: this.onEventHandler.bind(this),
                    mousedown: this.onEventHandler.bind(this),
                    mouseup: this.onEventHandler.bind(this),
                    rightclick: this.onEventHandler.bind(this),
                    click: this.onEventHandler.bind(this),
                    position_changed: (objEvent) => {
                        this.updatePopupPosition(objEvent);
                    }
                });
        };
        
        MapElementsCtrl.prototype.$onDestroy = function () { 
            this.closePopup();
        };


        /**
         * @ngdoc property
         * @propertyOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#defaultOptions
         * @type {Object}
         *
         * @description Default map components
         */
        MapElementsCtrl.prototype.defaultOptions = {
            popup: false,
            fitBounds: false
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#init
         * @param {Object} mapCtrl Instance of the map controller
         *
         * @description Init edition
         */
        MapElementsCtrl.prototype.init = function (mapCtrl) {
            this.mapCtrl = mapCtrl;
            this.initPopup();
        };

        MapElementsCtrl.prototype.setNewOptions = function (popupOptions) {
            if (this.popup) this.popup.setNewOptions(popupOptions);
        };



        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#initPopup
         *
         * @description Init popup for an element
         */
        MapElementsCtrl.prototype.initPopup = function () {
            if (!this.options.popup) {
                return;
            }

            this.options.popup = angular.merge({}, this.options.popup, {
                onShow: this.onShowPopup.bind(this),
                onClose: this.onClosePopup.bind(this)
            });

            this.pipMapHelperSrv.whenReady.then(function () {
                this.popup = this.mapCtrl.createElementPopup(this.options.popup);
            }.bind(this));
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#onShowPopup
         * @param {Object} model Model to which popup is shown
         * @param {Object} options Options of the popup
         *
         * @description On popup show handler
         */
        MapElementsCtrl.prototype.onShowPopup = function () {
            this.popUpOpened = true;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#onClosePopup
         *
         * @description On popup close handler
         */
        MapElementsCtrl.prototype.onClosePopup = function () {
            this.popUpOpened = false;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#getBoundsToFitAsync
         * @return {Promise} Promise for getting bounds
         *
         * @description Gets bounds from model positions to fit them. Does so async, after map is ready
         * If options for fitting is switched off - it rejects the promise
         */
        MapElementsCtrl.prototype.getBoundsToFitAsync = function () {
            if (!this.options.fitBounds) {
                return this.$q.reject('Fit is switched off');
            }

            return this.uiGmapIsReady.promise()
                .then(function () {
                    return this.getBounds();
                }.bind(this));
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#getBounds
         * @return {Object} Bounds for the models
         *
         * @description Gets bounds from model positions to fit them
         */
        MapElementsCtrl.prototype.getBounds = function () {
            return this.pipMapHelperSrv.getBoundsFromCoordinates(this.getAllPositions());
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#getAllPositions
         * @returns {Array<Object>} Positions for given model or an empty array
         *
         * @description Gets model positions array.
         */
        MapElementsCtrl.prototype.getAllPositions = function () {
            if (!angular.isArray(this.models)) {
                return [];
            }

            return this.models.map(function (model) {
                return this.getPosition(model);
            }, this);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#getPosition
         * @param {Object} model Model to get position for
         * @returns {Array<Map~position>|<Map~position>} Position for a model
         *
         * @description Default maker position getter. We use it if coords is set to 'self'
         */
        MapElementsCtrl.prototype.getPosition = function (model) {
            return {
                latitude: model.latitude,
                longitude: model.longitude
            };
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#isModelEmpty
         * @param {Object} model Model to check position for
         * @returns {boolean} True if current model is empty
         *
         * @description Checks whether model is empty
         */
        MapElementsCtrl.prototype.isModelEmpty = function (model) {
            var position = this.getPosition(model);
            return !position.latitude || !position.longitude;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#onClick
         * @param {Map~eventObj} eventObj Event object
         *
         * @description Handler on model click
         */
        MapElementsCtrl.prototype.onDblclick = function (eventObj) {
            this.externalDblclick(eventObj);
            //this.correctCircleModel(eventObj);
            //this.togglePopup(eventObj);
        };

        MapElementsCtrl.prototype.onClick = function (eventObj) {
            this.externalClick(eventObj);
            if (this.longClick) {
                this.correctCircleModel(eventObj);
                this.togglePopup(eventObj);
                this.longClick = false;
            } else {
                this.closePopup();
            }
            
        };

        MapElementsCtrl.prototype.correctCircleModel = function (eventObj) {
            if (eventObj.gModel.radius && eventObj.gModel.center) {
                let model = {};

                _.each(this.models, (m) => {
                    if (m[this.options.center] && m[this.options.radius]) {
                        if (m[this.options.center].latitude.toFixed(5) == eventObj.gModel.center.lat().toFixed(5) &&
                            m[this.options.center].longitude.toFixed(5) == eventObj.gModel.center.lng().toFixed(5) &&
                            m[this.options.radius].toFixed(5) === eventObj.gModel.radius.toFixed(5)) {
                            model = m;
                        }
                    }
                });

                eventObj.model = model;
            }
        };

        MapElementsCtrl.prototype.onRightclick = function (eventObj) {
            this.externalRightclick(eventObj);
            this.correctCircleModel(eventObj);
            this.togglePopup(eventObj);
        };

        MapElementsCtrl.prototype.onMousedown = function (eventObj) {
            this.start = new Date().getTime();
        };

        MapElementsCtrl.prototype.onMouseup = function (eventObj) {
            this.end = new Date().getTime();
            this.longClick = (this.end - this.start > 300);
        };

        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#togglePopup
         * @param {Map~eventObj} eventObj Event object
         *
         * @description Toggles popup
         */
        MapElementsCtrl.prototype.togglePopup = function (eventObj) {
            if (!this.popup) {
                return;
            }

            this.popup.toggle(eventObj);
        };

        MapElementsCtrl.prototype.closePopup = function (eventObj) {
            if (!this.popup) {
                return;
            }

            this.popup.close();
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#getModels
         * @returns {Array<Object>} Array of current models
         *
         * @description Returns current models list
         */
        MapElementsCtrl.prototype.getModels = function () {
            return this.models;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#checkContainsModel
         * @param {Object} model Model to check
         * @returns {boolean} True if contains
         *
         * @description Check whether current element contains given model
         */
        MapElementsCtrl.prototype.checkContainsModel = function (model) {
            return this.models.indexOf(model) > -1;
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#getPlural
         * @param {*} id Id of the model to get plural for
         * @returns {Object} Plural model with given id
         *
         * @description Returns plural models with given id.
         */
        MapElementsCtrl.prototype.getPlural = function (id) {
            return this.getPlurals().get(id);
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#getPlurals
         * @returns {Object} Plural object with methods
         *
         * @description Returns plurals models
         */
        MapElementsCtrl.prototype.getPlurals = function () {
            return this.control.getPlurals();
        };

        MapElementsCtrl.prototype.updatePopupPosition = function (objEvent) {
            if (this.popUpOpened === objEvent.model.id) {
                this.popup.setPosition({
                    latitude: objEvent.position.lat(),
                    longitude: objEvent.position.lng()
                });
            }
        }


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#freezeMap
         *
         * @description Freezes map
         */
        MapElementsCtrl.prototype.freezeMap = function () {
            return this.mapCtrl.freeze();
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#unfreezeMap
         *
         * @description unfreezes map
         */
        MapElementsCtrl.prototype.unfreezeMap = function () {
            return this.mapCtrl.unfreeze();
        };


        /**
         * @ngdoc method
         * @methodOf pipMapComponent.MapElementsCtrl
         * @name pipMapComponent.MapElementsCtrl#setCursor
         * @param {string} [cursor] Cursor code. If empty - the default behaviour is restored
         *
         * @description Overrides cursor for the map or set back default behaviour if cursor is not provided
         * @todo: This is not used currently. It was developed to able change cursors from actions
         */
        MapElementsCtrl.prototype.setCursor = function (cursor) {
            return this.mapCtrl.setCursor(cursor);
        };


        return MapElementsCtrl;
    }

    angular.module('pipMapsElements')
        .factory('MapElementsCtrlFct', MapElementsCtrlFct);
})();