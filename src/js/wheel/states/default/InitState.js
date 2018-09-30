import { ChainState } from '../ChainState';
import { getWheelInfo } from '../../calc_func';

export default class InitState extends ChainState {
	constructor(setState, wheelElement, wheelElementHolder) {
		super(setState);

		this._wheelElement = wheelElement;
		this._wheelElementHolder = wheelElementHolder;
	}

	changeState() {
		return () => {
			const translateState = getWheelInfo(this._wheelElement);

			return {
				...translateState,
				selectedElementHeight: translateState.elementHeight
			};
		};
	}
}
