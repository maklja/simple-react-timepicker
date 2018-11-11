import AbstractWheelValueModifier from './AbstractWheelValueModifier';

export default class DefaultWheelValueModifier extends AbstractWheelValueModifier {
	getValueStyles(value, index) {
		const opacity = this._getOpacity(
			index,
			this._selectedIndex,
			this._expandSize,
			1 / this._expandSize
		);
		return {
			opacity: Number.isFinite(opacity) ? opacity : 0
		};
	}

	_getOpacity(idx, selectedIdx, n, step) {
		const firstIdx = selectedIdx - n;
		const lastIdx = selectedIdx + n;
		if (idx >= firstIdx && idx <= lastIdx) {
			return idx > selectedIdx
				? step * (lastIdx - idx + 1)
				: step * (idx - firstIdx + 1);
		}

		return 0;
	}
}
