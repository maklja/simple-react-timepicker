import AbstractDragStrategy from './AbstractDragStrategy';

import InitState from '../wheel/states/default/InitState';
import PrepairChooseState from '../wheel/states/PrepairChooseState';
import DragStartedState from '../wheel/states/default/DragStartedState';
import DragStopedState from '../wheel/states/default/DragStopedState';
import DragingState from '../wheel/states/default/DragingState';

export default class DefaultDragStrategy extends AbstractDragStrategy {
	constructor(setState, valuePickerElRef, elRef) {
		super(setState);

		this._valuePickerElRef = valuePickerElRef;
		this._elRef = elRef;
	}

	isExpanded(state) {
		const { dragStarted } = state;
		return dragStarted;
	}

	isChooseStarted(state) {
		const { prepairChoose } = state;
		return prepairChoose;
	}

	init() {
		const initState = new InitState(
			this.setState,
			this._valuePickerElRef.current,
			this._elRef.current
		);

		return initState.executeState();
	}

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
