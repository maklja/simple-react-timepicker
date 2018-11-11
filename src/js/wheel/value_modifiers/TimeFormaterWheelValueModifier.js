import { timeFormater } from '../../utils/helper';
import DefaultWheelValueModifier from './DefaultWheelValueModifier';

export default class TimeFormaterWheelValueModifier extends DefaultWheelValueModifier {
	constructor(selectedIndex, expandSize, n) {
		super(selectedIndex, expandSize);
		this._formater = timeFormater(n);
	}

	formatValue(value) {
		return this._formater(value);
	}
}
