import DragStopedState from '../default/DragStopedState';

export default class AlwaysExpandDragStopedState extends DragStopedState {
	_isDragContinue() {
		return true;
	}
}
