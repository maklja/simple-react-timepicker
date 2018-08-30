import React from 'react';
import PropTypes from 'prop-types';

import createWheel from './Wheel';
import Button, { DIRECTION } from '../buttons/DefaultButton';

import { arrayRotateOne } from '../utils/helper';

import './styles.css';

export default class WheelPicker extends React.Component {
	constructor(props) {
		super(props);

		const { values, chooseValuesNumber, selectedIndex } = props;

		// TODO optimaze
		let expandedValues = [];
		const n = values.length * 3;
		while (expandedValues.length < n) {
			expandedValues = expandedValues.concat(values);
		}

		this.state = {
			dragStarted: false,
			translate: 0,
			dragStartPosition: 0,
			chooseStarted: false,
			elementHeight: 0,
			chooseValuesNumber: Math.min(
				chooseValuesNumber,
				Math.floor(values.length / 2)
			),
			values: expandedValues,
			offsetHeight: 0,
			// this state is used while draging wheel i drag started mode
			// it represents distance between starting point and current drag position'
			// after its value becomes greater then element height it will be restarted to zero
			// this way we can track over how many elements we passed during draging gesture
			// and ability to calculate currently selected value
			dragCrossed: 0,
			// set currently selected value
			selectedIndex
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
		const { valueFormater, enableAnimation, showButtons } = this.props;
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
		const chooseStyle = chooseStarted
			? {
					height: `${elementHeight * (2 * chooseValuesNumber + 1)}px`,
					marginTop: `-${elementHeight * chooseValuesNumber}px`
			  }
			: {};
		// if choose started we need to translate whole view port up so the selectet value
		// stays in the middle while active values are visible around it
		const activeDelta = chooseStarted
			? elementHeight * chooseValuesNumber
			: 0;

		const chooseClass = chooseStarted ? 'choose-started' : '';
		const translateY = translate + activeDelta;
		// if animation is enabled and if draging didn't started
		const animation = enableAnimation && dragStarted === false;

		const Wheel = createWheel(animation, {
			values: values,
			onElementCreated: el => (this._valuePickerEl = el),
			onMouseDown: this._onMouseDown,
			onMouseMove: this._onMouseMove,
			selectedIndex: this._getHighlightedIndex(),
			valueFormater: valueFormater,
			translateY: translateY,
			offsetHeight: offsetHeight
		});
		return (
			<div className={`wheel-holder ${chooseClass}`}>
				<Button
					onClick={this._moveToNextValue}
					visible={showButtons && dragStarted === false}
				/>
				<div
					tabIndex="0"
					ref={el => (this._wheelEl = el)}
					className="wheel-picker"
					onKeyDown={this._onKeyDown}
					onMouseUp={this._onMouseUp}
					onMouseLeave={this._onMouseLeave}
					onWheel={this._onWheel}
					style={{
						maxHeight: `${elementHeight}px`,
						height: `${elementHeight}px`
					}}
				>
					<div
						className="current-value"
						style={{
							minHeight: `${elementHeight}px`,
							...chooseStyle
						}}
					>
						{Wheel}
					</div>
				</div>
				<Button
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
		const startPosition = (valuesElementsSize * -1) / 3;

		this.setState(prevState => {
			const { selectedIndex } = prevState;

			return {
				translate: startPosition - selectedIndex * elementHeight,
				elementHeight,
				selectedIndex:
					selectedIndex + Math.floor(valuesChildren.length / 3)
			};
		});
	}

	_onKeyDown(e) {
		if (e.key === 'ArrowUp') {
			this._moveToNextValue(DIRECTION.UP);
		} else if (e.key === 'ArrowDown') {
			this._moveToNextValue(DIRECTION.DOWN);
		}
	}

	_onMouseMove(e) {
		if (this._isDragStarted() === false) {
			return;
		}

		this._drag(e.pageY);
	}

	_onMouseDown(e) {
		// if left click
		// TODO move to configuration
		if (e.button !== 0) {
			return;
		}

		const position = e.pageY;

		this.setState({
			dragStarted: true,
			dragStartPosition: position,
			chooseStarted: true
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
				dragCrossed: 0
			};
		});
	}

	// event is triggered on mouse wheel
	_onWheel(e) {
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

				newValues = arrayRotateOne(values, direction > 0);
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

	_moveToNextValue(direction) {
		this.setState(prevState => {
			const { translate, elementHeight, values } = prevState;

			const newValues = arrayRotateOne(values, direction > 0);

			return {
				translate: translate + elementHeight * direction,
				values: newValues,
				offsetHeight:
					prevState.offsetHeight + elementHeight * direction * -1
			};
		});
	}

	_getHighlightedIndex() {
		const {
			selectedIndex,
			dragStarted,
			dragCrossed,
			elementHeight
		} = this.state;

		if (dragStarted && Math.abs(dragCrossed) >= elementHeight / 2) {
			if (dragCrossed < -1) {
				return selectedIndex + 1;
			} else {
				return selectedIndex - 1;
			}
		}

		return selectedIndex;
	}
}

WheelPicker.propTypes = {
	values: PropTypes.arrayOf(
		PropTypes.oneOfType([PropTypes.number, PropTypes.string])
	).isRequired,
	selectedIndex: PropTypes.number,
	chooseValuesNumber: PropTypes.number,
	valueFormater: PropTypes.func,
	showButtons: PropTypes.bool,
	enableAnimation: PropTypes.bool
};

WheelPicker.defaultProps = {
	selectedIndex: 0,
	chooseValuesNumber: 4,
	valueFormater: val => val,
	showButtons: true,
	enableAnimation: true
};
