import React from 'react';
import PropTypes from 'prop-types';

import WheelPickerBody from './Wheel';

import { getWindowSize } from '../utils/helper';
import {
	sliceAroundMiddle,
	arrayRotate,
	duplicateArrayValues,
	nextTranslate,
	nextOffset,
	windowAvailableSpace,
	isInsideElement,
	getWheelInfo,
	checkInsufficientSpace,
	getValueElementByIndex
} from './calc_func';

import PrepairChooseState from './states/PrepairChooseState';
import DragStartedState from './states/DragStartedState';
import DragStopedState from './states/DragStopedState';
import DragingState from './states/DragingState';

import '../../assets/css/wheel/wheel.css';

const EXTEND_PADDING = 8;

export default class WheelPickerCore extends React.Component {
	constructor(props) {
		super(props);

		const { values, expandSize, selectedIndex } = props;

		let expandedValues = this._extendValues(
			values,
			expandSize,
			selectedIndex
		);

		this.state = {
			translate: 0,
			elementHeight: 0,
			selectedElementHeight: 0,
			expandSize,
			values: expandedValues,
			offsetHeight: 0,
			// some times in choose phase we dont have space to show
			// whole wheel because window edge, so we move wheel left or right
			// using margin
			marginLeft: 0,
			// set currently selected value
			selectedIndex: null,
			dragStarted: false,
			dragStartPosition: 0,
			// this state is used while draging wheel i drag started mode
			// it represents distance between starting point and current drag position'
			// after its value becomes greater then element height it will be restarted to zero
			// this way we can track over how many elements we passed during draging gesture
			// and ability to calculate currently selected value
			dragCrossed: 0,
			// there are two stages when we activate choose
			// first stage is only to add choose class to wheel and get current BoundingRect of selected
			// element and the second stage is reposition of the value elements so that selected value
			// stay at same position
			prepairChoose: false
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
		this.setState = this.setState.bind(this);
	}

	componentDidMount() {
		this.setState((prevState, props) => {
			const {
				alwaysExpand,
				expandSize,
				maintainSelectedValuePosition
			} = props;
			const translateState = getWheelInfo(this._valuePickerEl);

			if (alwaysExpand) {
				const { values } = prevState;
				const insufficientSpaceState = maintainSelectedValuePosition
					? checkInsufficientSpace(
							this._el.getBoundingClientRect(),
							translateState.selectedIndex,
							translateState.elementHeight,
							values,
							expandSize
					  )
					: {};
				const finalState = {
					prepairChoose: true,
					selectedElementHeight: translateState.elementHeight,
					...translateState,
					...insufficientSpaceState
				};

				return finalState;
			} else {
				return {
					...translateState,
					selectedElementHeight: translateState.elementHeight
				};
			}
		});
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

	_extendValues(values, maxLength, selectedIndex) {
		let expandedValues = duplicateArrayValues(
			values,
			maxLength * 2,
			selectedIndex
		);

		// rotate elements in the array so the first element is in the center of the array
		return arrayRotate(
			expandedValues,
			false,
			Math.round(expandedValues.length / 2)
		);
	}

	moveToNextValue(direction, n = 1) {
		this.setState(prevState => {
			const {
				translate,
				elementHeight,
				offsetHeight,
				values
			} = prevState;

			return {
				// translate to new value
				translate: nextTranslate(
					translate,
					elementHeight,
					direction,
					n
				),
				// change offset to simulate animation transition
				offsetHeight: nextOffset(
					offsetHeight,
					elementHeight,
					direction,
					n
				),
				// rotate values for n places in order to position at new value
				values: arrayRotate(values, direction > 0, n)
			};
		}, this._onValueChanged);
	}

	// called every time value on the wheel changes
	_onValueChanged() {
		const { values } = this.state;
		const { onChange, name } = this.props;

		// middle element is always selected one
		const selectedValueIndex = Math.round(values.length / 2);

		onChange(values[selectedValueIndex], name);
	}

	_onTouchStart(e) {
		if (this._isDisabled()) {
			return;
		}

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

		const { changedTouches } = e;

		if (changedTouches && changedTouches.length === 1) {
			e.stopPropagation();
			e.preventDefault();

			// get selected element
			const { top, height } = getValueElementByIndex(
				this._valuePickerEl,
				this.state.selectedIndex
			).getBoundingClientRect();

			// position of our touch
			const touchPosition = changedTouches[0].clientY;

			// if user clicks on active value we will stop drag event
			// otherwise we will allow user do continue drag in order to find value
			// that he wish to select
			const endDrag = !isInsideElement(top, height, touchPosition);

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
			e.currentTarget.focus();
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
		const prepairChooseState = new PrepairChooseState(
			this.setState,
			this._valuePickerEl,
			true
		);
		prepairChooseState
			.executeState()
			.then(({ valueBoundingRect, windowSize }) => {
				const dragStartedState = new DragStartedState(
					this.setState,
					this._valuePickerEl,
					this._el,
					valueBoundingRect,
					position,
					windowSize
				);

				return dragStartedState.executeState();
			})
			.then(() => {
				const { onDragStarted, name } = this.props;
				onDragStarted(name);
			});
	}

	_onDrag(position) {
		if (this._isDragStarted() === false) {
			return;
		}

		const dragingState = new DragingState(this.setState, position);
		dragingState.executeState();
	}

	_onDragStop(dragContinue = false) {
		if (this._isDragStarted() === false) {
			return;
		}

		const prepairChooseState = new PrepairChooseState(
			this.setState,
			this._valuePickerEl,
			dragContinue
		);
		prepairChooseState
			.executeState()
			.then(({ valueBoundingRect }) => {
				const dragStopedState = new DragStopedState(
					this.setState,
					this._valuePickerEl,
					this._el,
					dragContinue,
					valueBoundingRect
				);

				return dragStopedState.executeState();
			})
			.then(() => {
				if (dragContinue === false) {
					this.props.onDragStoped();
					this._onValueChanged();
				}
			});
	}

	_getChooseStyle() {
		if (this._el == null) {
			return {};
		}
		const { elementHeight, expandSize, marginLeft } = this.state;
		const { offsetTop, offsetBottom } = windowAvailableSpace(
			elementHeight,
			expandSize,
			this._el.getBoundingClientRect(),
			getWindowSize()
		);
		const marginTop = offsetBottom - offsetTop;

		return {
			height: `${elementHeight * (2 * expandSize + 1) +
				EXTEND_PADDING}px`,
			margin: `${marginTop}px 0 0 ${marginLeft}px`
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

	render() {
		const {
			valueFormater,
			enableAnimation,
			disabled,
			alwaysExpand
		} = this.props;

		const {
			translate,
			elementHeight,
			expandSize,
			values,
			offsetHeight,
			dragStarted,
			prepairChoose,
			selectedElementHeight
		} = this.state;

		const expanded = dragStarted || alwaysExpand;
		const chooseStarted = prepairChoose || alwaysExpand;

		// is component is in  choose mode we need to calculate the view port so the user can
		// see more vvalues from the wheel
		const chooseStyle = expanded ? this._getChooseStyle() : {};
		// if choose started we need to translate whole view port up so the selectet value
		// stays in the middle while active values are visible around it
		const activeDelta = expanded ? elementHeight * expandSize : 0;
		const dragStartedClass = chooseStarted ? 'choose-started' : '';

		const translateY = translate + activeDelta;
		const visibleValues = sliceAroundMiddle(values, expandSize * 2);

		return (
			<div
				ref={el => (this._el = el)}
				className={`wheel-holder ${dragStartedClass}`}
			>
				<WheelPickerBody
					values={visibleValues}
					selectedIndex={this._getHighlightedIndex()}
					onElementCreated={el => (this._valuePickerEl = el)}
					elementHeight={selectedElementHeight}
					animation={
						enableAnimation && this._isDragStarted() === false
					}
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
}

WheelPickerCore.propTypes = {
	expandSize: PropTypes.number,
	alwaysExpand: PropTypes.bool,
	name: PropTypes.string,
	values: PropTypes.arrayOf(
		PropTypes.oneOfType([PropTypes.number, PropTypes.string])
	).isRequired,
	selectedIndex: PropTypes.number,
	valueFormater: PropTypes.func,
	enableAnimation: PropTypes.bool,
	disabled: PropTypes.bool,
	maintainSelectedValuePosition: PropTypes.bool,
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
	expandSize: 4,
	alwaysExpand: false,
	name: null,
	selectedIndex: 0,
	valueFormater: val => val,
	enableAnimation: true,
	disabled: false,
	maintainSelectedValuePosition: true,
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
