/**
 * @file Controllers for split view sample page
 * @copyright Digital Living Software Corp. 2014-2015
 */

(function (angular) {
    'use strict';

    var thisModule = angular.module('app', [
        'ui.router', 'ngMaterial', 'LocalStorageModule',
        'ngMessages', 'ngAnimate', 'pipTranslate',
        'pipLayout', 'pipNav', 'pipBehaviors',
        'pipServices',

        'pipMaps', 'pipMaps.Templates',

        'pipSampleMaps'
    ]);

    thisModule.config(
        function ($urlRouterProvider, $mdIconProvider, $stateProvider, pipNavMenuProvider, pipSideNavProvider,
            pipNavIconProvider, pipBreadcrumbProvider) {

            $stateProvider
                .state('maps', {
                    url: '/maps',
                    controller: 'pipMapsSamplesController',
                    templateUrl: 'Maps.html'
                })
                .state('dot_traces', {
                    url: '/dot_traces',
                    controller: 'pipMapsDottracesSamplesController',
                    templateUrl: 'DottracesMap.html'
                })
                .state('ground_overlay', {
                    url: '/ground_overlay',
                    controller: 'pipMapsGroundOverlaySamplesController',
                    templateUrl: 'GroundOverlay.html'
                })
                .state('edit_polygon', {
                    url: '/edit_polygon',
                    controller: 'pipMapsEditPolygonSamplesController',
                    templateUrl: 'EditPolygon.html'
                });

            pipNavIconProvider.setMenu();
            pipBreadcrumbProvider.text = 'Maps';

            pipNavMenuProvider.sections = [{
                title: 'Map components',
                icon: 'icons:goal',
                links: [{
                    title: 'Map',
                    url: '/maps',
                    icon: 'icons:location'
                },
                {
                    title: 'Dottraces',
                    url: '/dot_traces',
                    icon: 'icons:dots'
                },
                {
                    title: 'Ground Overlay',
                    url: '/ground_overlay',
                    icon: 'icons:grid'
                },
                {
                    title: 'Edit polygon',
                    url: '/edit_polygon',
                    icon: 'icons:grid'
                }]
            }];
            pipSideNavProvider.type = 'popup';

            $urlRouterProvider.otherwise('/maps');
            $mdIconProvider.iconSet('icons', 'images/icons.svg', 512);
        }
    );

})(window.angular);