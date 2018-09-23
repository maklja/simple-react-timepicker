import { ChainState } from './ChainState';
import {
	checkInsufficientSpace,
	getValueElementByIndex,
	getWheelInfo
} from '../calc_func';
import { getWindowSize } from '../../utils/helper';

export default class DragStartedState extends ChainState {
	constructor(
		setState,
		wheelElement,
		wheelElementHolder,
		prepairBoundingRect,
		position,
		prevWindowSize
	) {
		super(setState);

		this._wheelElement = wheelElement;
		this._wheelElementHolder = wheelElementHolder;
		this._position = position;
		this._prepairBoundingRect = prepairBoundingRect;
		this._prevWindowSize = prevWindowSize;
	}

	changeState() {
		return (prevState, props) => {
			const { selectedIndex, values, marginLeft } = prevState;
			const {
				expandSize,
				maintainSelectedValuePosition,
				alwaysExpand
			} = props;

			// get current element height, in some cases after choose prepair is done
			// we will apply style that will change element height, so we need to recalculate
			// element size again
			const { elementHeight } = getWheelInfo(this._wheelElement);
			// top position of the selected element value before starting choose value phase
			// we need this to allign top position of our selected element with prevous one (the one
			// before elementHeight change)
			const prevTop = this._prepairBoundingRect.top;
			// get selected element
			const { top, left } = getValueElementByIndex(
				this._wheelElement,
				selectedIndex
			).getBoundingClientRect();

			const useState =
				alwaysExpand ||
				maintainSelectedValuePosition === false ||
				prevState.dragStarted;
			// new translate state that includes insufficient space translation for top or bottom
			const translateState = useState
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
				translate: prevState.translate + (prevTop - top) + heightDelta,
				dragStarted: true,
				dragStartPosition: this._position,
				elementHeight: elementHeight,
				marginLeft: this._getMarginLeft(marginLeft, left)
			};
		};
	}

	_getMarginLeft(marginLeft, elementLeft) {
		// get windows size after we enter choose phase
		const ws = getWindowSize();
		// calculate if we need to move wheel left or right in order to makse sure that it is fully visible
		// to the user
		if (elementLeft < 0) {
			return -elementLeft;
		} else if (this._prevWindowSize.width - ws.width) {
			return this._prevWindowSize.width - ws.width;
		}

		return marginLeft;
	}
}
