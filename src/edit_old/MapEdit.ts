(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name pipMapEditComponent.pipMapEdit
     * @restrict A
     *
     * @description Directive to create map. It is an abstraction between a map provider and the framework
     * Also it provides methods with controller to zoom, fit map, etc
     */

    /**
     * @ngdoc Controller
     * @name pipMapEditComponent.MapEditCtrl
     * @constructor
     * @description Controller for a map component (directive)
     */
    function MapEditCtrl($scope, $injector) {
        this.options = angular.merge({}, this.defaultOptions, this.pipOptions.edit);
        this.elements = [];
        this.$scope = $scope;

        var $interpolate = $injector.get('$interpolate');
        this.editTitleGetter = $interpolate(this.editTitleTemplate);

        //this.pipHeader = $injector.get('pipHeader');
    }


    /**
     * @ngdoc property
     * @propertyOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#editTitleTemplate
     * @type {string}
     *
     * @description Holds edit title template
     */
    MapEditCtrl.prototype.editTitleTemplate = '{{:: this.tool.title | translate }} {{:: this.name }}';


    /**
     * @ngdoc property
     * @propertyOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#defaultOptions
     * @type {Object}
     * @description Default map components
     */
    MapEditCtrl.prototype.defaultOptions = {
        template: 'edit/map-edit.html',
        toolsListTemplate: 'edit/map-edit-tools-list.html',
        toolTemplate: 'edit/map-edit-tool.html'
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#init
     * @param {Object} mapCtrl Instance of the map controller
     *
     * @description Init edition
     */
    MapEditCtrl.prototype.init = function (mapCtrl) {
        this.mapCtrl = mapCtrl;
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#$onDestroy
     *
     * @description $onDestroy handler
     */
    MapEditCtrl.prototype.$onDestroy = function () {
        this.resetHeaderBreakpoints();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#registerElement
     *
     * @param {Object} mapElementCtrl Map element controller instance
     * @param {pipMapEditComponent.MapEditToolFct} tool Tool instance
     *
     * @description Registers tool. Used by nested elements to be render in edition panel
     */
    MapEditCtrl.prototype.registerElement = function (mapElementCtrl, tool) {
        var info = tool.getInfo();
        var element = angular.extend({
            controller: mapElementCtrl,
            tool: tool,

            removeEventHandler: angular.noop
        }, info);

        element.getEditTitle = this.editTitleGetter.bind(null, element);

        this.elements.push(element);
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#enable
     *
     * @description Enables edition
     */
    MapEditCtrl.prototype.enable = function () {
        this.setListTemplate();
        this.removeMapEventHandler = this.mapCtrl.addEventHandler('click', this.onMapClick.bind(this));

        this.initReadyMode();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#disable
     *
     * @description Disables edition
     */
    MapEditCtrl.prototype.disable = function () {
        this.removeMapEventHandler();

        this.finishEditElement();
        this.finishReadyMode();

        this.resetTemplate();
    };


    /**
     * @ngdoc property
     * @propertyOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#removeMapEventHandler
     * @type {Function}
     * @description Default remove event handler method
     */
    MapEditCtrl.prototype.removeMapEventHandler = angular.noop;


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#initReadyMode
     *
     * @description Init ready mode for all registered tools
     */
    MapEditCtrl.prototype.initReadyMode = function () {
        this.elementEventHanldersRemovers = this.elements.map(function (element) {
            return element.controller.addEventHandler('click', this.onElementSelect.bind(this, element));
        }, this);
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#onElementSelect
     * @param {Object} element Element type clicked
     * @param {Map~eventObj} eventObj Event object with all event data
     *
     * @description On element select handler
     */
    MapEditCtrl.prototype.onElementSelect = function (element, eventObj) {
        this.finishReadyMode();
        this.selectElement(element, eventObj.model);
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#finishReadyMode
     *
     * @description Finishes ready mode for all registered tools
     */
    MapEditCtrl.prototype.finishReadyMode = function () {
        this.elementEventHanldersRemovers.forEach(function (remove) {
            remove();
        });
    };


    /**
     * @ngdoc property
     * @propertyOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#elementEventHanldersRemovers
     * @type {Array<Function>}
     * @description Array with default element event handlers removers
     */
    MapEditCtrl.prototype.elementEventHanldersRemovers = [];


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#selectElement
     * @param {Object} element Selected element
     * @param {Object} model Model to select for edition
     *
     * @description Selects element and model for edition
     */
    MapEditCtrl.prototype.selectElement = function (element, model) {
        this.startEditElement(element);
        element.tool.selectModel(model);

        this.setElementsHighlighting();
        this.setHeaderBreakpoints();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#selectModel
     * @param {Object} model Model to select for edition
     *
     * @description Selects model for edition. It searches for element related to that model
     */
    MapEditCtrl.prototype.selectModel = function (model) {
        var element = this.findElementByModel(model);

        if (!element) {
            return;
        }

        this.finishReadyMode();
        this.selectElement(element, model);
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#findElementByModel
     * @param {Object} model Model to search element for
     * @return {Object} Related to a model element
     *
     * @description Searches for element related to given model
     */
    MapEditCtrl.prototype.findElementByModel = function (model) {
        return this.elements.filter(function (element) {
            return element.controller.checkContainsModel(model);
        })[0];
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#createElement
     *
     * @param {Object} element Element to create (type)
     * @description Creates new element
     */
    MapEditCtrl.prototype.createElement = function (element) {
        this.startEditElement(element);
        element.tool.addNewModel();

        this.setElementsHighlighting();
        this.setHeaderBreakpoints();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#startEditElement
     * @param {Object} element Selected element
     *
     * @description Start element edit
     */
    MapEditCtrl.prototype.startEditElement = function (element) {
        if (this.currentElement) {
            this.finishEditElement();
        }

        this.currentElement = element;
        element.removeEventHandler = element.controller.addEventHandler('click', this.onElementClick.bind(this, element));
        this.setToolTemplate();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#finishEditElement
     *
     * @description Finish element edit
     */
    MapEditCtrl.prototype.finishEditElement = function () {
        if (!this.currentElement) {
            return;
        }

        this.currentElement.removeEventHandler();
        this.currentElement.tool.finish();
        this.currentElement = null;
        this.resetHeaderBreakpoints();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#onElementClick
     * @param {Object} element Selected element
     * @param {Map~eventObj} eventObj Event object with all event data
     *
     * @description On element click in edit mode
     */
    MapEditCtrl.prototype.onElementClick = function (element, eventObj) {
        element.tool.onElementClick(eventObj);
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#setHeaderBreakpoints
     *
     * @description Sets breakpoints of the header component
     */
    MapEditCtrl.prototype.setHeaderBreakpoints = function () {
        /*this.pipHeader.setBackBreakpoints([{
            name: 'xs',
            value: this.currentElement.getEditTitle()
        }]);*/
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#resetHeaderBreakpoints
     *
     * @description Resets breakpoints of the header component
     */
    MapEditCtrl.prototype.resetHeaderBreakpoints = function () {
       // this.pipHeader.resetBackBreakpoints();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#cancel
     *
     * @description Cancels edition
     */
    MapEditCtrl.prototype.cancel = function () {
        if (this.currentElement) {
            this.currentElement.tool.cancel();
        }

        this.finish();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#remove
     *
     * @description Removes currently edited model and saves
     */
    MapEditCtrl.prototype.remove = function () {
        if (this.currentElement) {
            this.currentElement.tool.removeCurrentModel();
        }

        this.save();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#save
     *
     * @description Finishes edit the element and saves edit results
     */
    MapEditCtrl.prototype.save = function () {
        if (this.currentElement) {
            this.currentElement.tool.save();
        }

        this.finish();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#finish
     *
     * @description Finishes edit of the element
     */
    MapEditCtrl.prototype.finish = function () {
        this.finishEditElement();
        this.initReadyMode();
        this.setListTemplate();
        this.resetElementsHighlighting();
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#onMapClick
     * @param {Map~eventObj} eventObj Event object with all event data
     *
     * @private
     * @description
     */
    MapEditCtrl.prototype.onMapClick = function (eventObj) {
        if (this.currentElement) {
            this.currentElement.tool.onMapClick(eventObj);
            return;
        }

        angular.noop(); //here is some logic if current lemenet is not selected
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#setElementsHighlighting
     *
     * @private
     * @description Highlights edit elements
     */
    MapEditCtrl.prototype.setElementsHighlighting = function () {
        this.elements.forEach(function (element) {
            element.tool.setEditOpacity();
        });
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#resetElementsHighlighting
     *
     * @private
     * @description Reset highlight of edit elements
     */
    MapEditCtrl.prototype.resetElementsHighlighting = function () {
        this.elements.forEach(function (element) {
            element.tool.resetEditOpacity();
        });
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#setListTemplate
     *
     * @private
     * @description Sets tools list template
     */
    MapEditCtrl.prototype.setListTemplate = function () {
        this.mapCtrl.showSidePanel(this.options.toolsListTemplate);
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#setToolTemplate
     *
     * @private
     * @description Sets tool template
     */
    MapEditCtrl.prototype.setToolTemplate = function () {
        this.mapCtrl.showSidePanel(this.options.toolTemplate);
    };


    /**
     * @ngdoc method
     * @methodOf pipMapEditComponent.MapEditCtrl
     * @name pipMapEditComponent.MapEditCtrl#resetTemplate
     *
     * @private
     * @description Resets template
     */
    MapEditCtrl.prototype.resetTemplate = function () {
        this.mapCtrl.hideSidePanel();
    };

    function pipMapEdit() {
        return {
            strict: 'A',
            scope: true,
            require: ['pipMap', 'pipMapEdit'],
            compile: function (tElem) {
                // attach template for map-edit with icons (as we are not able to put them as svg due to building processes)
                tElem.append('<ng-include src="\'edit/map-edit.html\'">');

                return function ($scope, $element, $attr, $controllers) {
                    var mapCtrl = $controllers[0];
                    var mapEditCtrl = $controllers[1];
                    var watcherExp = $attr.pipMapEdit.trim().indexOf('::') === 0 ? ':: editCtrl.enabled' : 'editCtrl.enabled';

                    mapEditCtrl.init(mapCtrl);

                    $scope.$watch(watcherExp, function (value) {
                        var method = value ? 'enable' : 'disable';
                        mapEditCtrl[method]();
                    });

                    //TODO: Remove this after moving to angular 1.5
                    $scope.$on('$destroy', mapEditCtrl.$onDestroy.bind(mapEditCtrl));
                };
            },

            bindToController: {
                pipOptions: '=',
                enabled: '=pipMapEdit'
            },
            controller: 'MapEditCtrl',
            controllerAs: 'editCtrl'
        };
    }

    angular.module('pipMapsEdit')
        .controller('MapEditCtrl', MapEditCtrl)
        .directive('pipMapEdit', pipMapEdit);
})();