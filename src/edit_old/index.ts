angular.module('pipMapsEdit', []);

import './config';
import './MapEdit';

import './actions/MapEditActionService';
import './actions/MapEditActionAddService';
import './actions/MapEditActionAddPolyService';
import './actions/MapEditActionEditPolyService';
import './actions/MapEditActionMoveService';
import './actions/MapEditActionPanService';
import './actions/MapEditActionRemovePolyService';

import './tools/MapEditToolService';
import './tools/MapEditToolPolyService';
import './tools/MapEditToolsService';
import './tools/MapEditUndoService';
