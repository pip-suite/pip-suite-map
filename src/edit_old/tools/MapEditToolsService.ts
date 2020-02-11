(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name pipMapEditComponent.mapEditToolsFct
   * @description Provides methods for creation tools for each map objects type
   */
  function mapEditToolsFct($injector) {
    var MapEditToolFct     = $injector.get('MapEditToolFct');
    var MapEditToolPolyFct = $injector.get('MapEditToolPolyFct');

    var MapEditActionAddPolyFct    = $injector.get('MapEditActionAddPolyFct');
    var MapEditActionEditPolyFct   = $injector.get('MapEditActionEditPolyFct');
    var MapEditActionAddFct        = $injector.get('MapEditActionAddFct');
    var MapEditActionRemovePolyFct = $injector.get('MapEditActionRemovePolyFct');
    var MapEditActionMoveFct       = $injector.get('MapEditActionMoveFct');
    var MapEditActionPanFct        = $injector.get('MapEditActionPanFct');

    return {
      markers: function (options, controller) {
        return new MapEditToolFct({
          options   : options,
          actions   : [
            new MapEditActionAddFct(),
            new MapEditActionPanFct(),
            new MapEditActionMoveFct()
          ],
          controller: controller
        });
      },


      polylines: function (options, controller) {
        return new MapEditToolPolyFct({
          options   : options,
          actions   : [
            new MapEditActionAddPolyFct(),
            new MapEditActionEditPolyFct(),
            new MapEditActionRemovePolyFct(),
            new MapEditActionPanFct(),
            new MapEditActionMoveFct()
          ],
          controller: controller,

          actionsDisabledForExisting: [0]
        });
      },


      polygons: function (options, controller) {
        return new MapEditToolPolyFct({
          options   : options,
          actions   : [
            new MapEditActionAddPolyFct(),
            new MapEditActionEditPolyFct(),
            new MapEditActionRemovePolyFct(),
            new MapEditActionPanFct(),
            new MapEditActionMoveFct()
          ],
          controller: controller,

          actionsDisabledForExisting: [0]
        });
      }
    };
  }

  angular.module('pipMapsEdit')
    .factory('mapEditToolsFct', mapEditToolsFct);
})();
