/// <reference path="../typings/tsd.d.ts" />

import './popup';
import './elements';
import './edit';
//import './editable_element/EditableElement';

{
    angular.module('pipMaps', [
        'uiGmapgoogle-maps',
        // Map services
        'pipMaps.Templates',
        'pipMapsPopup',
        'pipMapsElements',
  //      'pipMapsEditableElement',
        'pipMapsEdit'
    ]);
}

import './config';
import './GoogleMapsRemoveAfterService';
import './HelpService';
import './Map';
import './MapEventHandlerService';
