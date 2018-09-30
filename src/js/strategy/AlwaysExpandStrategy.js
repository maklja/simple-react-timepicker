import AlwaysExpandInitState from '../wheel/states/always_expand/AlwaysExpandInitState';
import AlwaysExpandDragStartedState from '../wheel/states/always_expand/AlwaysExpandDragStartedState';
import AlwaysExpandDragStopedState from '../wheel/states/always_expand/AlwaysExpandDragStopedState';

import PrepairChooseState from '../wheel/states/PrepairChooseState';

import DefaultDragStrategy from './DefaultDragStrategy';

export default class AlwaysExpandStrategy extends DefaultDragStrategy {
	isExpanded(state) {
		return true;
	}

	isChooseStarted(state) {
		return true;
	}

	init() {
		const alwaysExpandInitState = new AlwaysExpandInitState(
			this.setState,
			this._valuePickerElRef.current,
			this._elRef.current
		);

		return alwaysExpandInitState
			.executeState()
			.then(() => {
				const prepairChooseState = new PrepairChooseState(
					this.setState,
					this._valuePickerElRef.current,
					true
				);
				return prepairChooseState.executeState();
			})
			.then(({ valueBoundingRect, windowSize }) => {
				const dragStartedState = new AlwaysExpandDragStartedState(
					this.setState,
					this._valuePickerElRef.current,
					this._elRef.current,
					valueBoundingRect,
					0,
					windowSize
				);

				return dragStartedState.executeState();
			});
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
				const dragStopedState = new AlwaysExpandDragStopedState(
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
