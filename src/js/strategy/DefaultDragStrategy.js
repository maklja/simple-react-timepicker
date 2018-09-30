import PrepairChooseState from '../wheel/states/PrepairChooseState';
import DragStartedState from '../wheel/states/DragStartedState';
import DragStopedState from '../wheel/states/DragStopedState';
import DragingState from '../wheel/states/DragingState';

export default class DefaultDragStrategy {
	constructor(setState, valuePickerElRef, elRef) {
		this.setState = setState;

		this._valuePickerElRef = valuePickerElRef;
		this._elRef = elRef;
	}

	// init state
	// init() {

	// }

	onDragStart(position) {
		const prepairChooseState = new PrepairChooseState(
			this.setState,
			this._valuePickerElRef.current,
			true
		);
		return prepairChooseState
			.executeState()
			.then(({ valueBoundingRect, windowSize }) => {
				const dragStartedState = new DragStartedState(
					this.setState,
					this._valuePickerElRef.current,
					this._elRef.current,
					valueBoundingRect,
					position,
					windowSize
				);

				return dragStartedState.executeState();
			});
	}

	onDrag(position) {
		const dragingState = new DragingState(this.setState, position);
		return dragingState.executeState();
	}

	onDragStop(dragContinue) {
		const prepairChooseState = new PrepairChooseState(
			this.setState,
			this._valuePickerElRef.current,
			dragContinue
		);
		return prepairChooseState
			.executeState()
			.then(({ valueBoundingRect }) => {
				const dragStopedState = new DragStopedState(
					this.setState,
					this._valuePickerElRef.current,
					this._elRef.current,
					dragContinue,
					valueBoundingRect
				);

				return dragStopedState.executeState();
			});
	}
}
