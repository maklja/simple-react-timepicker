import { ChainState } from './ChainState';
import { getValueElementByIndex } from '../calc_func';

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
			this._ws = {
				width: window.innerWidth,
				height: window.innerHeight
			};

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
