import DragStartedState from '../default/DragStartedState';

export default class AlwaysExpandDragStartedState extends DragStartedState {
	_checkInsufficientSpace() {
		return true;
	}
}
