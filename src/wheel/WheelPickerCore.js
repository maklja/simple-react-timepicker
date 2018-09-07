import React from 'react';
import PropTypes from 'prop-types';

import { WheelPickerBody } from './Wheel';

import { arrayRotate, getWindowSize } from '../utils/helper';

import './styles.css';

const FREE_SPACE_PADDING = 20; // px

export default class WheelPickerCore extends React.Component {
	constructor(props) {
		super(props);

		const { values, extendValuesTime, selectedIndex } = props;

		let expandedValues = this._extendValues(
			values,
			extendValuesTime,
			selectedIndex
		);

		this.state = {
			translate: 0,
			elementHeight: 0,
			extendValuesTime,
			values: expandedValues,
			offsetHeight: 0,
			// set currently selected value
			selectedIndex: null,
			dragStarted: false,
			dragStartPosition: 0,
			// this state is used while draging wheel i drag started mode
			// it represents distance between starting point and current drag position'
			// after its value becomes greater then element height it will be restarted to zero
			// this way we can track over how many elements we passed during draging gesture
			// and ability to calculate currently selected value
			dragCrossed: 0
		};

		this._touchActive = false;

		this.collapse = this.collapse.bind(this);
		this._onMouseDown = this._onMouseDown.bind(this);
		this._onMouseMove = this._onMouseMove.bind(this);
		this._onMouseUp = this._onMouseUp.bind(this);
		this._onMouseLeave = this._onMouseLeave.bind(this);
		this._onWheel = this._onWheel.bind(this);
		this._onKeyDown = this._onKeyDown.bind(this);
		this._onTouchStart = this._onTouchStart.bind(this);
		this._onTouchMove = this._onTouchMove.bind(this);
		this._onTouchEnd = this._onTouchEnd.bind(this);
		this._onTouchCancel = this._onTouchCancel.bind(this);
	}

	render() {
		const { valueFormater, enableAnimation, disabled } = this.props;
		const {
			translate,
			elementHeight,
			extendValuesTime,
			values,
			offsetHeight,
			dragStarted
		} = this.state;

		// is component is in  choose mode we need to calculate the view port so the user can
		// see more vvalues from the wheel
		const chooseStyle = dragStarted ? this._getChooseStyle() : {};
		// if choose started we need to translate whole view port up so the selectet value
		// stays in the middle while active values are visible around it
		const activeDelta = dragStarted ? elementHeight * extendValuesTime : 0;
		const dragStartedClass = dragStarted ? 'choose-started' : '';

		const translateY = translate + activeDelta;

		const middleValueIndex = Math.round(values.length / 2);
		const beginIndex = middleValueIndex - extendValuesTime * 2;
		const endIndex = middleValueIndex + extendValuesTime * 2;
		const visibleValues = values.slice(
			beginIndex < 0 ? 0 : beginIndex,
			endIndex
		);

		return (
			<div
				ref={el => (this._el = el)}
				className={`wheel-holder ${dragStartedClass}`}
			>
				<WheelPickerBody
					values={visibleValues}
					selectedIndex={this._getHighlightedIndex()}
					onElementCreated={el => (this._valuePickerEl = el)}
					elementHeight={elementHeight}
					animation={enableAnimation && dragStarted === false}
					offsetHeight={offsetHeight}
					valueFormater={valueFormater}
					translate={translateY}
					onTouchStart={this._onTouchStart}
					onTouchEnd={this._onTouchEnd}
					onTouchMove={this._onTouchMove}
					onTouchCancel={this._onTouchCancel}
					onMouseDown={this._onMouseDown}
					onMouseMove={this._onMouseMove}
					onMouseUp={this._onMouseUp}
					onMouseLeave={this._onMouseLeave}
					onWheel={this._onWheel}
					disabled={disabled}
					onKeyDown={this._onKeyDown}
					currentValueStyle={chooseStyle}
				/>
			</div>
		);
	}

	componentDidMount() {
		this._calculateElementValueSize();
		window.addEventListener('touchstart', this.collapse);
	}

	componentWillUnmount() {
		this._valuePickerEl = null;
		window.removeEventListener('touchstart', this.collapse);
	}

	collapse() {
		this._touchActive = false;
		this._onDragStop();
	}

	_calculateElementValueSize() {
		// we must have reference to wheel DOM top element in order to calculate size of the single value inside of it
		if (this._valuePickerEl == null) {
			throw new Error('Reference to mandatory DOM element not found');
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

	_translateRoundPosition(translate, elementHeight) {
		return Math.round(translate / elementHeight) * elementHeight;
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

	moveToNextValue(direction, n = 1) {
		this.setState(prevState => {
			return this._calculateNextValue(prevState, direction, n);
		}, this._onValueChanged);
	}

	_calculateNextValue(
		{ translate, elementHeight, offsetHeight, values },
		direction,
		n
	) {
		// rotate values for n places in order to position at new value
		const newValues = arrayRotate(values, direction > 0, n);

		return {
			// translate to new value
			translate: translate + n * elementHeight * direction,
			// change offset to simulate animation transition
			offsetHeight: offsetHeight + n * elementHeight * direction * -1,
			values: newValues
		};
	}

	// called every time value on the wheel changes
	_onValueChanged() {
		const { values } = this.state;
		const { onChange, name } = this.props;

		// middle element is always selected one
		const selectedValueIndex = Math.round(values.length / 2);

		onChange(values[selectedValueIndex], name);
	}

	_edgeTranslation(state, extendValuesTime, direction = 1) {
		const {
			selectedIndex,
			elementHeight,
			translate,
			values,
			offsetHeight
		} = state;
		// get available spaces before and after wheel
		const { maxSpaceTop, maxSpaceBottom } = this._getAvailableSpace(
			elementHeight,
			extendValuesTime
		);

		// set default values
		let newSelectedIndex = selectedIndex;
		let newTranslateStae = {
			translate,
			values,
			offsetHeight,
			selectedIndex
		};

		// there is only change that there is no space before or after wheel, but not both, atleast in theory
		// bottom
		if (maxSpaceBottom !== extendValuesTime) {
			// translate values to new position so that all values are visible1
			newTranslateStae = this._calculateNextValue(
				state,
				direction,
				extendValuesTime - maxSpaceBottom
			);
			// new selected index
			newSelectedIndex += (extendValuesTime - maxSpaceBottom) * direction;
			// top
		} else if (maxSpaceTop !== extendValuesTime) {
			newTranslateStae = this._calculateNextValue(
				state,
				-1 * direction,
				extendValuesTime - maxSpaceTop
			);
			newSelectedIndex -= (extendValuesTime - maxSpaceTop) * direction;
		}

		return {
			...newTranslateStae,
			selectedIndex: newSelectedIndex
		};
	}

	_onTouchStart(e) {
		if (e.changedTouches && e.changedTouches.length === 1) {
			e.stopPropagation();
			e.preventDefault();

			this._touchActive = true;

			const position = e.changedTouches[0].pageY;

			this._onDragStart(position);
		}
	}

	_onTouchMove(e) {
		if (this._isDisabled() || this._isTouchActive() === false) {
			return;
		}

		if (
			this._isDragStarted() &&
			e.changedTouches &&
			e.changedTouches.length === 1
		) {
			e.preventDefault();
			e.stopPropagation();

			const position = e.changedTouches[0].pageY;
			this._onDrag(position);
		}
	}

	_onTouchEnd(e) {
		if (this._isDisabled() || this._isTouchActive() === false) {
			return;
		}

		const { changedTouches, currentTarget } = e;

		if (changedTouches && changedTouches.length === 1) {
			e.stopPropagation();
			e.preventDefault();

			const { elementHeight } = this.state;

			// current target is wheel main center div
			const { top } = currentTarget.getBoundingClientRect();
			// position of our touch
			const touchPosition = changedTouches[0].pageY;
			// if user clicks on active value we will stop drag event
			// otherwise we will allow user do continue drag in order to find value
			// that we wish to select
			const endDrag =
				(top <= touchPosition &&
					touchPosition <= top + elementHeight) === false;

			this._onDragStop(endDrag);
		}
	}

	_onTouchCancel(e) {
		if (this._isDisabled() || this._isTouchActive() === false) {
			return;
		}

		e.stopPropagation();
		e.preventDefault();
		this._onDragStop();
	}

	_onMouseDown(e) {
		if (this._isDisabled() || this._isTouchActive()) {
			return;
		}

		// if left click
		// TODO move to configuration
		if (e.button === 0) {
			const position = e.pageY;
			this._onDragStart(position);
		}
		this.props.onMouseDown(e);
	}

	_onMouseMove(e) {
		if (this._isDisabled() || this._isTouchActive()) {
			return;
		}

		this._onDrag(e.pageY);

		this.props.onMouseMove(e);
	}

	_onMouseUp(e) {
		if (this._isDisabled() || this._isTouchActive()) {
			return;
		}

		if (e.button === 0) {
			this._onDragStop();
		}

		this.props.onMouseUp(e);
	}

	_onMouseLeave(e) {
		if (this._isDisabled() || this._isTouchActive()) {
			return;
		}
		this._onDragStop();
		this.props.onMouseLeave(e);
	}

	_onWheel(e) {
		if (this._isDisabled()) {
			return;
		}

		this.props.onWheel(e);
	}

	_onKeyDown(e) {
		if (this._isDisabled()) {
			return;
		}

		this.props.onKeyDown(e);
	}

	_onDragStart(position) {
		this.setState(
			(prevState, props) => {
				const translateState = this._edgeTranslation(
					prevState,
					props.extendValuesTime
				);
				return {
					dragStarted: true,
					dragStartPosition: position,
					...translateState
				};
			},
			() => {
				const { onDragStarted, name } = this.props;
				onDragStarted(name);
			}
		);
	}

	_onDrag(position) {
		if (this._isDragStarted() === false) {
			return;
		}

		this.setState(prevState => {
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
			const newPosition = position + translate - dragStartPosition;
			const newDelta = dragCrossed + newPosition - translate;

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
					translate: newPosition,
					dragStartPosition: position,
					dragCrossed: newDelta - elementHeight * direction * n,
					values: arrayRotate(values, direction > 0, n),
					offsetHeight:
						offsetHeight + elementHeight * direction * -1 * n
				};
			} else {
				return {
					translate: newPosition,
					dragStartPosition: position,
					dragCrossed: newDelta,
					values: values,
					offsetHeight: offsetHeight
				};
			}
		});
	}

	_onDragStop(dragContinue = false) {
		if (this._isDragStarted() === false) {
			return;
		}

		this.setState(
			(prevState, props) => {
				const { elementHeight, dragCrossed } = prevState;

				const {
					translate,
					values,
					offsetHeight,
					selectedIndex
				} = this._edgeTranslation(
					prevState,
					props.extendValuesTime,
					-1
				);

				return {
					dragStarted: dragContinue,
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
					values,
					offsetHeight,
					selectedIndex
				};
			},
			() => {
				if (dragContinue === false) {
					this.props.onDragStoped();
					this._onValueChanged();
				}
			}
		);
	}

	// TODO document
	_getAvailableSpace(elementHeight, extendValuesTime) {
		let { top, bottom } = this._el.getBoundingClientRect();
		const { height } = getWindowSize();

		top += -FREE_SPACE_PADDING;
		bottom += FREE_SPACE_PADDING;
		// calculate top available space
		// calculate how many elements can fit before time picker
		const maxSpaceTop = Math.min(
			extendValuesTime,
			Math.round(top / elementHeight)
		);
		const offsetTop = maxSpaceTop * elementHeight;

		// calculate bottom available space
		// calculate how many elements can fit after time picker
		const maxSpaceBottom = Math.min(
			extendValuesTime,
			Math.round(Math.abs(height - bottom) / elementHeight)
		);
		const offsetBottom =
			(extendValuesTime - maxSpaceBottom) * elementHeight * -1;

		return {
			maxSpaceTop,
			maxSpaceBottom,
			offsetTop,
			offsetBottom
		};
	}

	_getChooseStyle() {
		const { elementHeight, extendValuesTime } = this.state;
		const { offsetTop, offsetBottom } = this._getAvailableSpace(
			elementHeight,
			extendValuesTime
		);

		return {
			height: `${elementHeight * (2 * extendValuesTime + 1)}px`,
			marginTop: `-${offsetTop - offsetBottom}px`
		};
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

	_isDisabled() {
		return this.props.disabled;
	}

	_isDragStarted() {
		return this.state.dragStarted;
	}

	_isTouchActive() {
		return this._touchActive;
	}
}

WheelPickerCore.propTypes = {
	extendValuesTime: PropTypes.number,
	name: PropTypes.string,
	values: PropTypes.arrayOf(
		PropTypes.oneOfType([PropTypes.number, PropTypes.string])
	).isRequired,
	selectedIndex: PropTypes.number,
	valueFormater: PropTypes.func,
	enableAnimation: PropTypes.bool,
	disabled: PropTypes.bool,
	onChange: PropTypes.func,
	onMouseDown: PropTypes.func,
	onMouseMove: PropTypes.func,
	onMouseUp: PropTypes.func,
	onMouseLeave: PropTypes.func,
	onWheel: PropTypes.func,
	onKeyDown: PropTypes.func,
	onDragStarted: PropTypes.func,
	onDragStoped: PropTypes.func
};

WheelPickerCore.defaultProps = {
	extendValuesTime: 4,
	name: null,
	selectedIndex: 0,
	valueFormater: val => val,
	enableAnimation: true,
	disabled: false,
	onChange: () => {},
	onMouseDown: () => {},
	onMouseMove: () => {},
	onMouseUp: () => {},
	onMouseLeave: () => {},
	onWheel: () => {},
	onKeyDown: () => {},
	onDragStarted: () => {},
	onDragStoped: () => {}
};
