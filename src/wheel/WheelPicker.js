import React from 'react';
import PropTypes from 'prop-types';

import './styles.css';

const MOVE_DELTA = 10;

export default class WheelPicker extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			dragStarted: false,
			translate: 0,
			dragStartPosition: 0,
			chooseStarted: false,
			elementHeight: 0
		};
		const { values, activeValues } = props;

		this._values = [];
		const n = values.length * 3;
		while (this._values.length < n) {
			this._values = this._values.concat(values);
		}

		this._onMouseDown = this._onMouseDown.bind(this);
		this._onMouseMove = this._onMouseMove.bind(this);
		this._onMouseUp = this._onMouseUp.bind(this);
		this._onMouseLeave = this._onMouseLeave.bind(this);
		this._onWheel = this._onWheel.bind(this);
	}

	render() {
		const { activeValues, valueFormater } = this.props;
		const { translate, chooseStarted, elementHeight } = this.state;
		// calculate current selected value
		const selectedValueIndex =
			Math.round(Math.abs(translate / elementHeight)) || 0;
		// is component is in  choose mode we need to calculate the view port so the user can
		// see more vvalues from the wheel
		const chooseStyle = chooseStarted
			? {
					height: `${elementHeight * (2 * activeValues + 1)}px`,
					marginTop: `-${elementHeight * activeValues}px`
			  }
			: {};
		// if choose started we need to translate whole view port up so the selectet value
		// stays in the middle while active values are visible around it
		const activeDelta = chooseStarted ? elementHeight * activeValues : 0;

		return (
			<div
				ref={el => (this._wheelEl = el)}
				className="wheel-picker"
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
					<div
						onMouseDown={this._onMouseDown}
						onMouseMove={this._onMouseMove}
						ref={el => (this._valuePickerEl = el)}
						style={{
							transform: `translateY(${translate +
								activeDelta}px)`
						}}
					>
						{this._values.map((curVal, i) => (
							<div
								key={i}
								className={`value ${
									selectedValueIndex === i ? 'active' : ''
								}`}
								style={{
									...this._getValueVisibility(
										i,
										selectedValueIndex
									)
								}}
							>
								{valueFormater(curVal)}
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	componentDidMount() {
		// get container of each value and calculate accumulator of height
		const valuesChildren = this._valuePickerEl.children;
		const valuesElementsSize = Array.from(valuesChildren).reduce(
			(accumulator, curEl) => accumulator + curEl.offsetHeight,
			0
		);
		const { selectedValue } = this.props;
		const elementHeight = valuesElementsSize / valuesChildren.length;
		const { top } = this._valuePickerEl.getBoundingClientRect();

		// define where scroll postion start and where it ends
		// we need this in order to reset transaltion to initial value
		// and maintain illusion that scroll is infinitive
		this._scroll = {
			startPosition: -valuesElementsSize / 3,
			resetPosition: -(2 * valuesElementsSize) / 3,
			initPosition: top
		};

		this.setState({
			translate:
				this._scroll.startPosition - selectedValue * elementHeight,
			elementHeight
		});
	}

	_onMouseMove(e) {
		if (this._isDragStarted() === false) {
			return;
		}

		this._drag(e.pageY);
	}

	_onMouseDown(e) {
		const position = e.pageY;

		this.setState(prevState => {
			return {
				dragStarted: true,
				dragStartPosition: position - prevState.translate,
				chooseStarted: true
			};
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
			const { translate, elementHeight } = prevState;

			return {
				dragStarted: false,
				chooseStarted: false,
				translate: this._translateRoundPosition(
					translate,
					elementHeight
				)
			};
		});
	}

	// event is triggered on mouse wheel
	_onWheel(e) {
		// check if reset position is needed to maintain illusion of infitite scroll
		this._resetScrollPosition();
		// direction of scrolling
		const direction = Math.sign(e.deltaY);

		this.setState(prevState => {
			const { translate, elementHeight, dragStartPosition } = prevState;
			// calculate new translate position and also calculate new dragStartPosition
			// to enable draging and scrolling in the same time
			const newTranslatePosition = translate + elementHeight * direction;
			// round position is the value is visible to the user
			const roundNewTranslatePosition = this._translateRoundPosition(
				newTranslatePosition,
				elementHeight
			);
			const roundDelta = newTranslatePosition - roundNewTranslatePosition;
			return {
				translate: roundNewTranslatePosition,
				dragStartPosition:
					dragStartPosition - elementHeight * direction + roundDelta
			};
		});
	}

	_drag(mousePosition) {
		this._resetScrollPosition(mousePosition);
		this.setState(prevState => {
			const { dragStartPosition } = prevState;
			// calculate distance between prevous position and current one
			// and translate component by that value
			const moveDelta = mousePosition - dragStartPosition;

			return {
				translate: moveDelta
			};
		});
	}

	_resetScrollPosition(mousePosition = 0) {
		// get values for startPosition that is initial value,
		// and value when we need to reset translation to startPosition
		const { startPosition, resetPosition, initPosition } = this._scroll;
		// scrollable component top position
		const { top } = this._valuePickerEl.getBoundingClientRect();

		if (top < resetPosition + MOVE_DELTA + initPosition) {
			this.setState({
				translate: startPosition,
				dragStartPosition: mousePosition - startPosition
			});

			// only go to half of the first time array
		} else if (top - initPosition >= startPosition / 2) {
			const targetPosition = (3 / 2) * startPosition;

			this.setState({
				translate: startPosition,
				dragStartPosition: mousePosition - targetPosition
			});
		}
	}

	_getValueVisibility(index, selectedValueIndex) {
		const difference = Math.abs(index - selectedValueIndex);
		const { activeValues } = this.props;

		if (difference <= activeValues) {
			return {
				opacity: 1 / (1 + difference)
			};
		} else {
			return {
				opacity: 0
			};
		}
	}

	_isDragStarted() {
		return this.state.dragStarted;
	}

	_translateRoundPosition(translate, elementHeight) {
		return Math.round(translate / elementHeight) * elementHeight;
	}
}

WheelPicker.propTypes = {
	values: PropTypes.arrayOf(
		PropTypes.oneOfType([PropTypes.number, PropTypes.string])
	).isRequired,
	selectedValue: PropTypes.number,
	activeValues: PropTypes.number,
	valueFormater: PropTypes.func
};

WheelPicker.defaultProps = {
	selectedValue: 0,
	activeValues: 4,
	valueFormater: val => val
};
