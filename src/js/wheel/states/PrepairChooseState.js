import { ChainState } from './ChainState';
import { getValueElementByIndex } from '../calc_func';
import { getWindowSize } from '../../utils/helper';

export default class PrepairChooseState extends ChainState {
	get selectedValueBoundingRect() {
		return this._selectedValueBB;
	}

	constructor(setState, el, isPrepairChoose) {
		super(setState);

		this._el = el;
		this._selectedValueBB = null;
		this._ws = null;
		this._isPrepairChoose = isPrepairChoose;
	}

	changeState() {
		return prevState => {
			const { selectedIndex } = prevState;
			this._selectedValueBB = getValueElementByIndex(
				this._el,
				selectedIndex
			).getBoundingClientRect();
			this._ws = getWindowSize();

			return { prepairChoose: this._isPrepairChoose };
		};
	}

	_onResolve() {
		return {
			valueBoundingRect: this.selectedValueBoundingRect,
			windowSize: this._ws
		};
	}
}
