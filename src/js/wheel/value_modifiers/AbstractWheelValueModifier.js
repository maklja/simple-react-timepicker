export default class AbstractWheelValueModifier {
	get selectedIndex() {
		return this._selectedIndex;
	}

	get expandSize() {
		return this._expandSize;
	}

	constructor(selectedIndex, expandSize) {
		this._selectedIndex = selectedIndex; // selected value inside wheel
		this._expandSize = expandSize; // number of visible items in wheel when expanded
	}

	isSelected(value, index) {
		// is current value selected or not
		return index === this._selectedIndex;
	}

	getValueStyles(value, index) {
		// specific style for current value
		return {};
	}

	formatValue(value, index) {
		// format current value
		return value;
	}
}
