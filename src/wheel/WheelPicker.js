import React from 'react';
import PropTypes from 'prop-types';

import { AnimationWheel, Wheel } from './Wheel';
import Button, { DIRECTION } from '../buttons/DefaultButton';

import { arrayRotate } from '../utils/helper';

import './styles.css';

const getWindowSize = () => {
	let width = 0,
		height = 0;
	if (typeof window.innerWidth == 'number') {
		// Non-IE
		width = window.innerWidth;
		height = window.innerHeight;
	} else if (
		document.documentElement &&
		(document.documentElement.clientWidth ||
			document.documentElement.clientHeight)
	) {
		// IE 6+ in 'standards compliant mode'
		width = document.documentElement.clientWidth;
		height = document.documentElement.clientHeight;
	} else if (
		document.body &&
		(document.body.clientWidth || document.body.clientHeight)
	) {
		// IE 4 compatible
		width = document.body.clientWidth;
		height = document.body.clientHeight;
	}

	return { width, height };
};

export default class WheelPicker extends React.Component {
	constructor(props) {
		super(props);

		const { values, chooseValuesNumber, selectedIndex } = props;

		let expandedValues = this._extendValues(
			values,
			chooseValuesNumber,
			selectedIndex
		);

		this.state = {
			dragStarted: false,
			translate: 0,
			dragStartPosition: 0,
			chooseStarted: false,
			elementHeight: 0,
			chooseValuesNumber,
			values: expandedValues,
			offsetHeight: 0,
			// this state is used while draging wheel i drag started mode
			// it represents distance between starting point and current drag position'
			// after its value becomes greater then element height it will be restarted to zero
			// this way we can track over how many elements we passed during draging gesture
			// and ability to calculate currently selected value
			dragCrossed: 0,
			// set currently selected value
			selectedIndex: null
		};

		this._onMouseDown = this._onMouseDown.bind(this);
		this._onMouseMove = this._onMouseMove.bind(this);
		this._onMouseUp = this._onMouseUp.bind(this);
		this._onMouseLeave = this._onMouseLeave.bind(this);
		this._onWheel = this._onWheel.bind(this);
		this._moveToNextValue = this._moveToNextValue.bind(this);
		this._onKeyDown = this._onKeyDown.bind(this);
	}

	render() {
		const {
			valueFormater,
			enableAnimation,
			showButtons,
			disabled
		} = this.props;
		const {
			translate,
			chooseStarted,
			elementHeight,
			chooseValuesNumber,
			values,
			offsetHeight,
			dragStarted
		} = this.state;

		// is component is in  choose mode we need to calculate the view port so the user can
		// see more vvalues from the wheel
		const chooseStyle = chooseStarted ? this._getChooseStyle() : {};
		// if choose started we need to translate whole view port up so the selectet value
		// stays in the middle while active values are visible around it
		const activeDelta = chooseStarted
			? elementHeight * chooseValuesNumber
			: 0;
		const chooseClass = chooseStarted ? 'choose-started' : '';
		const disabledClass = disabled ? 'disabled' : '';

		const translateY = translate + activeDelta;
		// if animation is enabled and if draging didn't started
		const animation = enableAnimation && dragStarted === false;

		const middleValueIndex = Math.round(values.length / 2);
		const beginIndex = middleValueIndex - chooseValuesNumber * 2;
		const endIndex = middleValueIndex + chooseValuesNumber * 2;
		const visibleValues = values.slice(
			beginIndex < 0 ? 0 : beginIndex,
			endIndex
		);

		return (
			<div
				ref={el => (this._el = el)}
				className={`wheel-holder ${chooseClass} ${disabledClass}`}
			>
				<Button
					disabled={disabled}
					onClick={this._moveToNextValue}
					visible={showButtons && dragStarted === false}
				/>
				<div
					style={{
						maxHeight: `${elementHeight}px`,
						height: `${elementHeight}px`
					}}
					tabIndex={disabled ? '' : '0'}
					className="wheel-picker"
					onKeyDown={this._onKeyDown}
					onMouseUp={this._onMouseUp}
					onMouseLeave={this._onMouseLeave}
					onWheel={this._onWheel}
				>
					<div
						className="current-value"
						style={{
							minHeight: `${elementHeight}px`,
							...chooseStyle
						}}
					>
						{animation ? (
							<AnimationWheel
								values={visibleValues}
								onElementCreated={el =>
									(this._valuePickerEl = el)
								}
								onMouseDown={this._onMouseDown}
								onMouseMove={this._onMouseMove}
								selectedIndex={this._getHighlightedIndex()}
								valueFormater={valueFormater}
								translateY={translateY}
								offsetHeight={offsetHeight}
								chooseStarted={chooseStarted}
							/>
						) : (
							<Wheel
								values={visibleValues}
								onElementCreated={el =>
									(this._valuePickerEl = el)
								}
								onMouseDown={this._onMouseDown}
								onMouseMove={this._onMouseMove}
								selectedIndex={this._getHighlightedIndex()}
								valueFormater={valueFormater}
								translateY={translateY}
								offsetHeight={offsetHeight}
								chooseStarted={chooseStarted}
							/>
						)}
					</div>
				</div>
				<Button
					disabled={disabled}
					direction={DIRECTION.DOWN}
					onClick={this._moveToNextValue}
					visible={showButtons && dragStarted === false}
				/>
			</div>
		);
	}

	componentDidMount() {
		if (this._valuePickerEl == null) {
			return;
		}
		// first div in children, called offset-div is used to provide well offset during translation
		// and shouldn't be included in calculations
		const valuesChildren = Array.from(this._valuePickerEl.children).filter(
			curEl => curEl.classList.contains('offset-div') === false
		);
		// get container of each value and calculate accumulator of height
		const valuesElementsSize = valuesChildren.reduce(
			(accumulator, curEl) => accumulator + curEl.offsetHeight,
			0
		);

		// calculate single element height
		const elementHeight = valuesElementsSize / valuesChildren.length;
		const startPosition = this._translateRoundPosition(
			-valuesElementsSize / 2,
			elementHeight
		);

		this.setState({
			translate: startPosition,
			elementHeight,
			selectedIndex: Math.abs(startPosition / elementHeight)
		});
	}

	componentWillUnmount() {
		this._valuePickerEl = null;
	}

	_onKeyDown(e) {
		if (this._isDisabled()) {
			return;
		}

		if (e.key === 'ArrowUp') {
			this._moveToNextValue(DIRECTION.UP);
		} else if (e.key === 'ArrowDown') {
			this._moveToNextValue(DIRECTION.DOWN);
		}
	}

	_onMouseMove(e) {
		if (this._isDisabled()) {
			return;
		}

		if (this._isDragStarted() === false) {
			return;
		}

		this._drag(e.pageY);
	}

	_onMouseDown(e) {
		if (this._isDisabled()) {
			return;
		}

		// if left click
		// TODO move to configuration
		if (e.button !== 0) {
			return;
		}

		const position = e.pageY;

		const { chooseValuesNumber } = this.props;
		const { selectedIndex } = this.state;
		const { maxSpaceTop, maxSpaceBottom } = this._getAvailableSpace();

		let newSelectedIndex = selectedIndex;
		if (maxSpaceBottom !== chooseValuesNumber) {
			this._moveToNextValue(1, chooseValuesNumber - maxSpaceBottom);
			newSelectedIndex += chooseValuesNumber - 1;
		} else if (maxSpaceTop !== chooseValuesNumber) {
			this._moveToNextValue(-1, chooseValuesNumber - maxSpaceTop);
			newSelectedIndex -= chooseValuesNumber;
		}

		this.setState({
			dragStarted: true,
			dragStartPosition: position,
			chooseStarted: true,
			selectedIndex: newSelectedIndex
		});
	}

	_onMouseUp() {
		this._dragStop();
	}

	_onMouseLeave() {
		this._dragStop();
	}

	_dragStop() {
		if (this._isDragStarted() === false) {
			return;
		}

		const { chooseValuesNumber } = this.props;
		const { maxSpaceTop, maxSpaceBottom } = this._getAvailableSpace();
		const { selectedIndex } = this.state;

		let newSelectedIndex = selectedIndex;
		if (maxSpaceBottom !== chooseValuesNumber) {
			this._moveToNextValue(-1, chooseValuesNumber - maxSpaceBottom);
			newSelectedIndex -= chooseValuesNumber - 1;
		} else if (maxSpaceTop !== chooseValuesNumber) {
			this._moveToNextValue(1, chooseValuesNumber - maxSpaceTop);
			newSelectedIndex += chooseValuesNumber;
		}

		this.setState(prevState => {
			const { translate, elementHeight, dragCrossed } = prevState;

			return {
				dragStarted: false,
				chooseStarted: false,
				// we need to round position because current translated distance
				// wont fit in current value div, so we need to round it up
				// for example if single value height is 29 px, translation point must
				// go 29px, 58px, 87px and so on, this will ensure that currently selected value
				// is always visible
				translate: this._translateRoundPosition(
					// because draging can interapted at any time
					// we need to include current draging distance
					// to avoid rounding errors
					translate - dragCrossed,
					elementHeight
				),
				dragCrossed: 0,
				selectedIndex: newSelectedIndex
			};
		}, this._onValueChanged);
	}

	// event is triggered on mouse wheel
	_onWheel(e) {
		if (this._isDisabled()) {
			return;
		}

		// direction of scrolling
		const direction = Math.sign(e.deltaY);
		this._moveToNextValue(direction);
	}

	_translateRoundPosition(translate, elementHeight) {
		return Math.round(translate / elementHeight) * elementHeight;
	}

	_isDragStarted() {
		return this.state.dragStarted;
	}

	_drag(mousePosition) {
		this.setState(prevState => {
			let { dragStartPosition, values, elementHeight } = prevState;
			// calculate distance between prevous position and current one
			// and translate component by that value
			const newPosition =
				mousePosition + prevState.translate - dragStartPosition;
			let dragCrossed =
				prevState.dragCrossed + newPosition - prevState.translate;

			let newValues = values;
			let offsetHeight = prevState.offsetHeight;
			// pass to the next value if we crossed half path of element height
			// this way we can select next element without need to drag whole element
			// height to select next value
			if (Math.abs(dragCrossed) > elementHeight / 2) {
				const direction = Math.sign(dragCrossed);

				newValues = arrayRotate(values, direction > 0);
				dragCrossed = dragCrossed - elementHeight * direction;
				offsetHeight =
					prevState.offsetHeight + elementHeight * direction * -1;
			}

			return {
				translate: newPosition,
				dragStartPosition: mousePosition,
				dragCrossed: dragCrossed,
				values: newValues,
				offsetHeight: offsetHeight
			};
		});
	}

	_moveToNextValue(direction, n = 1) {
		this.setState(prevState => {
			const { translate, elementHeight, values, nextValue } = prevState;

			const newValues = arrayRotate(values, direction > 0, n);

			return {
				translate: translate + n * elementHeight * direction,
				values: newValues,
				offsetHeight:
					prevState.offsetHeight + n * elementHeight * direction * -1,
				nextValue: nextValue + n * direction
			};
		}, this._onValueChanged);
	}

	_getHighlightedIndex() {
		const {
			selectedIndex,
			dragStarted,
			dragCrossed,
			elementHeight
		} = this.state;

		// if we passed half of the current element during dragin we need to select
		// neighbor one, which one will be selected depends on direction of draging
		if (dragStarted && Math.abs(dragCrossed) >= elementHeight / 2) {
			if (dragCrossed < -1) {
				return selectedIndex + 1;
			} else {
				return selectedIndex - 1;
			}
		}

		return selectedIndex;
	}

	_extendValues(values, maxValuesNumber, selectedIndex) {
		// create copy of the current values
		let valuesCopy = [...values];

		valuesCopy = arrayRotate(valuesCopy, false, selectedIndex);

		// maxValues number represent number of visible elements during selection mode
		// if array doesn't have enough elements we need to clone them multiple times in
		// order to satisfy maxValuesNumber condition
		if (valuesCopy.length < maxValuesNumber) {
			while (valuesCopy.length <= maxValuesNumber * 2) {
				valuesCopy = valuesCopy.concat(valuesCopy);
			}
		}

		// rotate elements in the array so the first element is in the center of the array
		return arrayRotate(
			valuesCopy,
			false,
			Math.round(valuesCopy.length / 2)
		);
	}

	// called every time value on the wheel changes
	_onValueChanged() {
		const { values } = this.state;
		const { onChange, name } = this.props;

		// middle element is always selected one
		const selectedValueIndex = Math.round(values.length / 2);

		onChange(values[selectedValueIndex], name);
	}

	_isDisabled() {
		return this.props.disabled;
	}

	// TODO document
	_getAvailableSpace() {
		const { elementHeight, chooseValuesNumber } = this.state;

		const { top, bottom } = this._el.getBoundingClientRect();
		const { height } = getWindowSize();

		// calculate top available space
		// calculate how many elements can fit before time picker
		const maxSpaceTop = Math.min(
			chooseValuesNumber,
			Math.round(top / elementHeight)
		);
		const offsetTop = maxSpaceTop * elementHeight;

		// calculate bottom available space
		// calculate how many elements can fit after time picker
		const maxSpaceBottom = Math.min(
			chooseValuesNumber,
			Math.round(Math.abs(height - bottom) / elementHeight)
		);
		const offsetBottom =
			(chooseValuesNumber - maxSpaceBottom) * elementHeight * -1;

		return {
			maxSpaceTop,
			maxSpaceBottom,
			offsetTop,
			offsetBottom
		};
	}

	_getChooseStyle() {
		const { elementHeight, chooseValuesNumber } = this.state;
		const { offsetTop, offsetBottom } = this._getAvailableSpace();

		return {
			height: `${elementHeight * (2 * chooseValuesNumber + 1)}px`,
			marginTop: `-${offsetTop - offsetBottom}px`
		};
	}
}

WheelPicker.propTypes = {
	name: PropTypes.string,
	values: PropTypes.arrayOf(
		PropTypes.oneOfType([PropTypes.number, PropTypes.string])
	).isRequired,
	selectedIndex: PropTypes.number,
	chooseValuesNumber: PropTypes.number,
	valueFormater: PropTypes.func,
	showButtons: PropTypes.bool,
	enableAnimation: PropTypes.bool,
	disabled: PropTypes.bool,
	onChange: PropTypes.func
};

WheelPicker.defaultProps = {
	name: '',
	selectedIndex: 0,
	chooseValuesNumber: 4,
	valueFormater: val => val,
	showButtons: true,
	enableAnimation: true,
	disabled: false,
	onChange: () => {}
};
