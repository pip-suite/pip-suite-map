
(() => {
  'use strict';

  function MapElementPopupFct($injector) {
    var pipMapHelperSrv = $injector.get('pipMapHelperSrv');
    var $rootScope = $injector.get('$rootScope');

    /**
     * @ngdoc service
     * @name pipMapComponent.MapElementPopupFct
     *
     * @class
     * @description Element popup class
     */
    function MapElementPopupFct(options) {
      var er = new Error();
      var offset = pipMapHelperSrv.createSize(options.offset.width, options.offset.height);

      this.options = angular.merge({
        boxClass: 'pip-map-info-window ' + options.className,
        closeBoxURL: '',
        pixelOffset: offset
      }, options.options);

      this.templateUrl = options.templateUrl;

      this.onShow = options.onShow;
      this.onClose = options.onClose;

      this.initBreakpoints(options.offset.breakpoints);
    }


    /**
     * @ngdoc method
     * @methodOf pipMapComponent.MapElementPopupFct
     * @name pipMapComponent.MapElementPopupFct#initBreakpoints
     * @private
     *
     * @param {Array<Object>} breakpoints Array of breakpoint to init
     *
     * @description Init popup breakpoints if any
     */
    MapElementPopupFct.prototype.initBreakpoints = function (breakpoints) {
      breakpoints = breakpoints || [];

      this.breakpoints = breakpoints.map(function (breakpoint) {
        return {
          name: breakpoint.name,
          offset: pipMapHelperSrv.createSize(breakpoint.width, breakpoint.height)
        };
      }, this);

      this.defaultOffset = this.options.pixelOffset;
    };

    MapElementPopupFct.prototype.setNewOptions = function (options) {
      var offset = pipMapHelperSrv.createSize(options.offset.width, options.offset.height);

      this.options = angular.merge({
        boxClass: 'pip-map-info-window ' + options.className,
        closeBoxURL: '',
        pixelOffset: offset
      }, options.options);

      this.initBreakpoints(options.offset.breakpoints);
      this.fitOffset();
    }


    /**
     * @ngdoc method
     * @methodOf pipMapComponent.MapElementPopupFct
     * @name pipMapComponent.MapElementPopupFct#close
     *
     * @description Closes element popup
     */
    MapElementPopupFct.prototype.close = function () {
      this.onClose();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapComponent.MapElementPopupFct
     * @name pipMapComponent.MapElementPopupFct#show
     * @param {Object} model to show popup for
     *
     * @description Shows element popup
     */
    MapElementPopupFct.prototype.show = function (model) {
      this.onShow(model);
      this.fitOffset();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapComponent.MapElementPopupFct
     * @name pipMapComponent.MapElementPopupFct#setPosition
     *
     * @description Sets position of the element popup
     */
    MapElementPopupFct.prototype.setPosition = function () {
      this.fitOffset();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapComponent.MapElementPopupFct
     * @name pipMapComponent.MapElementPopupFct#fitOffset
     *
     * @description
     */
    MapElementPopupFct.prototype.fitOffset = function () {
      var hasBreakpoint = this.breakpoints.some(function (breakpoint) {
        var isTargetBreakpoint = $rootScope.utils.hasBreakpoint(breakpoint.name);

        if (isTargetBreakpoint) {
          this.options.pixelOffset = breakpoint.offset;
          return true;
        }
      }, this);

      if (!hasBreakpoint) {
        this.options.pixelOffset = this.defaultOffset;
      }
    };


    return {
      /**
       * @ngdoc method
       * @methodOf pipMapComponent.MapElementPopupFct
       * @name pipMapComponent.MapElementPopupFct#fitOffset
       * @static
       *
       * @description
       */
      create: function (options) {
        return new MapElementPopupFct(options);
      }
    };
  }

  angular.module('pipMapsPopup')
    .factory('MapElementPopupFct', MapElementPopupFct);

})();
