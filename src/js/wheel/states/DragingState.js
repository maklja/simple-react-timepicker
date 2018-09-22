import { ChainState } from './ChainState';
import {
	convertPostionToTranslate,
	nextTranslateDelta,
	arrayRotate,
	nextOffset
} from '../calc_func';

export default class DragingState extends ChainState {
	constructor(setState, position) {
		super(setState);

		this._position = position;
	}

	changeState() {
		return prevState => {
			let {
				dragStartPosition,
				values,
				elementHeight,
				translate,
				dragCrossed,
				offsetHeight
			} = prevState;
			// calculate distance between prevous position and current one
			// and translate component by that value
			const newTranslate = convertPostionToTranslate(
				this._position,
				dragStartPosition,
				translate
			);
			const newDelta = nextTranslateDelta(
				dragCrossed,
				newTranslate,
				translate
			);

			// pass to the next value if we crossed half path of element height
			// this way we can select next element without need to drag whole element
			// height to select next value
			if (Math.abs(newDelta) > elementHeight / 2) {
				const direction = Math.sign(newDelta);
				// n is number of elements we crossed during draging gesture
				// it is posible that we passed multiple elements if we
				// drag "too fast"
				const n = Math.round(Math.abs(newDelta / elementHeight));
				return {
					translate: newTranslate,
					dragStartPosition: this._position,
					dragCrossed: newDelta - elementHeight * direction * n,
					values: arrayRotate(values, direction > 0, n),
					offsetHeight: nextOffset(
						offsetHeight,
						elementHeight,
						direction,
						n
					)
				};
			} else if (translate !== newTranslate) {
				return {
					translate: newTranslate,
					dragStartPosition: this._position,
					dragCrossed: newDelta,
					values: values,
					offsetHeight: offsetHeight
				};
			} else {
				// there is no diffrence between prevous position and the new one
				// so do not trigger changes
				return null;
			}
		};
	}
}
