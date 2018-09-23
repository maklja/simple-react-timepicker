import { ChainState } from './ChainState';
import {
	sliceAroundMiddle,
	roundValueByStep,
	getWheelInfo,
	arrayRotate
} from '../calc_func';

export default class DragStopedState extends ChainState {
	constructor(
		setState,
		wheelElement,
		wheelElementHolder,
		dragContinue,
		prepairBoundingRect
	) {
		super(setState);

		this._wheelElement = wheelElement;
		this._wheelElementHolder = wheelElementHolder;
		this._dragContinue = dragContinue;
		this._prepairBoundingRect = prepairBoundingRect;
	}

	changeState() {
		return (prevState, props) => {
			if (this._dragContinue) {
				return {
					// we need to round position because current translated distance
					// wont fit in current value div, so we need to round it up
					// for example if single value height is 29 px, translation point must
					// go 29px, 58px, 87px and so on, this will ensure that currently selected value
					// is always visible
					// translate: elementHeight * Math.round(values1.length / 2) * -1,
					// offsetHeight: 0,
					translate: roundValueByStep(
						// because draging can interapted at any time
						// we need to include current draging distance
						// to avoid rounding errors
						prevState.translate - prevState.dragCrossed,
						prevState.elementHeight
					),
					dragCrossed: 0
				};
			} else {
				const { expandSize } = props;
				const { values, selectedIndex } = prevState;
				const { elementHeight } = getWheelInfo(this._wheelElement);

				const visibleValues = sliceAroundMiddle(values, 2 * expandSize);
				const newSelectedIndex = Math.round(visibleValues.length / 2);
				const selectedIndexDelta = selectedIndex - newSelectedIndex;
				const newValues = arrayRotate(
					values,
					selectedIndexDelta < 0,
					Math.abs(selectedIndexDelta)
				);
				return {
					dragStarted: this._dragContinue,
					// we need to round position because current translated distance
					// wont fit in current value div, so we need to round it up
					// for example if single value height is 29 px, translation point must
					// go 29px, 58px, 87px and so on, this will ensure that currently selected value
					// is always visible
					translate: -elementHeight * newSelectedIndex,
					values: newValues,
					selectedIndex: newSelectedIndex,
					elementHeight,
					offsetHeight: 0,
					dragCrossed: 0,
					marginLeft: 0
				};
			}
		};
	}
}
