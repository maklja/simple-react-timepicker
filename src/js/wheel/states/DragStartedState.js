import { ChainState } from './ChainState';
import {
	checkInsufficientSpace,
	getValueElementByIndex,
	getWheelInfo
} from '../calc_func';

export default class DragStartedState extends ChainState {
	constructor(
		setState,
		wheelElement,
		wheelElementHolder,
		prepairBoundingRect,
		position
	) {
		super(setState);

		this._wheelElement = wheelElement;
		this._wheelElementHolder = wheelElementHolder;
		this._position = position;
		this._prepairBoundingRect = prepairBoundingRect;
	}

	changeState() {
		return (prevState, props) => {
			const { selectedIndex, values } = prevState;
			const { expandSize } = props;

			const { elementHeight } = getWheelInfo(this._wheelElement);
			const top = this._prepairBoundingRect.top;
			const newTop = getValueElementByIndex(
				this._wheelElement,
				selectedIndex
			).getBoundingClientRect().top;

			const translateState = prevState.dragStarted
				? {}
				: checkInsufficientSpace(
						this._wheelElementHolder.getBoundingClientRect(),
						selectedIndex,
						elementHeight,
						values,
						expandSize
				  );
			const heightDelta = prevState.elementHeight - elementHeight;
			return {
				...translateState,
				translate: prevState.translate + (top - newTop) + heightDelta,
				dragStarted: true,
				dragStartPosition: this._position,
				elementHeight: elementHeight
			};
		};
	}
}
