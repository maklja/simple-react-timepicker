import React from 'react';
import PropTypes from 'prop-types';

import WheelPickerBody from './Wheel';

import { themeClassName } from '../utils/helper';
import {
	arrayRotate,
	duplicateArrayValues,
	nextTranslate,
	nextOffset,
	windowAvailableSpace,
	isInsideElement,
	getValueElementByIndex,
	getVisibleValues
} from './calc_func';

import DefaultDragStrategy from '../strategy/DefaultDragStrategy';
import AlwaysExpandStrategy from '../strategy/AlwaysExpandStrategy';
import DefaultWheelValueModifier from './value_modifiers/DefaultWheelValueModifier';

import '../../assets/scss/wheel/index.scss';

const EXTEND_PADDING = 8;
const MIN_EXPAND_SIZE = 3;

export default class WheelPickerCore extends React.Component {
	constructor(props) {
		super(props);

		const { values, expandSize, selectedIndex } = props;

		const expandSizeMin = Math.max(expandSize, MIN_EXPAND_SIZE);
		let expandedValues = this._extendValues(
			values,
			expandSizeMin,
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
			marginLeft: 0, // TODO
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

		this._el = React.createRef();
		this._valuePickerEl = React.createRef();

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

	componentWillMount() {
		const { alwaysExpand } = this.props;
		this._dragStrategy = alwaysExpand
			? new AlwaysExpandStrategy(
					this.setState,
					this._valuePickerEl,
					this._el
			  )
			: new DefaultDragStrategy(
					this.setState,
					this._valuePickerEl,
					this._el
			  );
	}

	componentDidMount() {
		this._dragStrategy.init();
		window.addEventListener('touchstart', this.collapse);
	}

	componentWillUnmount() {
		this._valuePickerEl = null;
		this._el = null;
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
		const { values, selectedIndex } = this.state;
		const { onChange, name, expandSize } = this.props;

		const visibleValues = getVisibleValues(values, expandSize);

		onChange(visibleValues[selectedIndex], name);
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
				this._valuePickerEl.current,
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
		this._dragStrategy.onDragStart(position).then(() => {
			const { onDragStarted, name } = this.props;
			onDragStarted(name);
		});
	}

	_onDrag(position) {
		if (this._isDragStarted() === false) {
			return;
		}

		this._dragStrategy.onDrag(position);
	}

	_onDragStop(dragContinue = false) {
		if (this._isDragStarted() === false) {
			return;
		}

		this._dragStrategy.onDragStop(dragContinue).then(() => {
			if (dragContinue === false) {
				this.props.onDragStoped();
				this._onValueChanged();
			}
		});
	}

	_getChooseStyle() {
		if (this._el.current == null) {
			return {};
		}
		const { elementHeight, expandSize } = this.state;
		const { offsetTop, offsetBottom } = windowAvailableSpace(
			elementHeight,
			expandSize,
			this._el.current.getBoundingClientRect(),
			{
				height: window.innerHeight
			}
		);
		const marginTop = offsetBottom - offsetTop;

		return {
			height: `${elementHeight * (2 * expandSize + 1) +
				EXTEND_PADDING}px`,
			marginTop: `${marginTop}px`
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
		const { enableAnimation, disabled, valueModifierFactory } = this.props;

		const {
			translate,
			elementHeight,
			expandSize,
			values,
			offsetHeight,
			selectedElementHeight
		} = this.state;
		const { theme } = this.props;

		const expanded = this._dragStrategy.isExpanded(this.state, this.props);
		const chooseStarted = this._dragStrategy.isChooseStarted(
			this.state,
			this.props
		);

		// if component is in  choose mode we need to calculate the view port so the user can
		// see more values from the wheel
		const chooseStyle = expanded ? this._getChooseStyle() : {};
		// if choose started we need to translate whole view port up so the selectet value
		// stays in the middle while active values are visible around it
		const activeDelta = expanded ? elementHeight * expandSize : 0;
		const dragStartedClass = chooseStarted ? 'choose-started' : '';

		const translateY = translate + activeDelta;
		// use slice around middle to limit number of elements that we need to show in DOM
		// we take extend size and multiple it by 2 in order to show extend size elements
		// above and bellow middle value. We add plus 1 to prevent edge case that element
		// is not visible on edge, so show 1 element more on above and bellow
		const visibleValues = getVisibleValues(values, expandSize);
		const themeClass = themeClassName(theme);

		const valueModifier = valueModifierFactory(
			this._getHighlightedIndex(),
			expandSize
		);

		return (
			<div
				ref={this._el}
				className={`wheel-holder ${themeClass} ${dragStartedClass}`}
			>
				<WheelPickerBody
					values={visibleValues}
					selectedIndex={this._getHighlightedIndex()}
					setRef={this._valuePickerEl}
					elementHeight={selectedElementHeight}
					animation={
						enableAnimation && this._isDragStarted() === false
					}
					offsetHeight={offsetHeight}
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
					valueModifier={valueModifier}
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
	onDragStoped: PropTypes.func,
	theme: PropTypes.string,
	valueModifierFactory: PropTypes.func
};

WheelPickerCore.defaultProps = {
	expandSize: 4,
	alwaysExpand: false,
	name: null,
	selectedIndex: 0,
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
	onDragStoped: () => {},
	theme: 'light',
	valueModifierFactory: (selectedIndex, expandSize) =>
		new DefaultWheelValueModifier(selectedIndex, expandSize)
};
