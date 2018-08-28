import React from 'react';
import PropTypes from 'prop-types';
import { Motion, spring } from 'react-motion';

import Button, { DIRECTION } from '../buttons/DefaultButton';

import './styles.css';

const MOVE_DELTA = 10;
const springSetting1 = { stiffness: 390, damping: 17 };

// const WheelAnimation = ({enabled, translateY, animationSettings, children} => {

// 	return enabled ? <Motion style={animationSettings}>{children}</Motion>
// })

const Wheel = ({
	values,
	selectedIndex,
	onMouseDown,
	onMouseMove,
	onElementCreated,
	valueFormater,
	valueVisibility,
	translateY
}) => {
	return (
		<div
			onMouseDown={onMouseDown}
			onMouseMove={onMouseMove}
			ref={onElementCreated}
			style={{
				transform: `translateY(${translateY}px)`
			}}
		>
			{values.map((curVal, i) => (
				<div
					key={i}
					className={`value ${selectedIndex === i ? 'active' : ''}`}
					style={{
						...valueVisibility(i, selectedIndex)
					}}
				>
					{valueFormater(curVal)}
				</div>
			))}
		</div>
	);
};

export default class WheelPicker extends React.Component {
	constructor(props) {
		super(props);

		const { values, chooseValuesNumber } = props;

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
			enableAnimation: true,
			animationSettings: {}
		};

		this._scroll = {};

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
		this._moveToNextValue = this._moveToNextValue.bind(this);
		this._getValueVisibility = this._getValueVisibility.bind(this);
	}

	render() {
		const { valueFormater, showButtons } = this.props;
		const {
			translate,
			chooseStarted,
			elementHeight,
			chooseValuesNumber,
			animationSettings
		} = this.state;
		// calculate current selected value
		const selectedIndex =
			Math.round(Math.abs(translate / elementHeight)) || 0;
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
		const tt = {
			...springSetting1,
			...animationSettings,
			translateY: spring(translateY, {
				...springSetting1,
				...animationSettings
			})
			// stiffness: 0,
		};
		console.log(tt);
		const enableAnimation = false;
		return (
			<div className={chooseClass}>
				<Button onClick={this._moveToNextValue} visible={showButtons} />
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
						{enableAnimation ? (
							<Motion style={tt}>
								{({ translateY }) => (
									<Wheel
										values={this._values}
										onElementCreated={el =>
											(this._valuePickerEl = el)
										}
										onMouseDown={this._onMouseDown}
										onMouseMove={this._onMouseMove}
										selectedIndex={selectedIndex}
										animationSettings={tt}
										valueFormater={valueFormater}
										valueVisibility={
											this._getValueVisibility
										}
										translateY={translateY}
									/>
								)}
							</Motion>
						) : (
							<Wheel
								values={this._values}
								onElementCreated={el =>
									(this._valuePickerEl = el)
								}
								onMouseDown={this._onMouseDown}
								onMouseMove={this._onMouseMove}
								selectedIndex={selectedIndex}
								animationSettings={tt}
								valueFormater={valueFormater}
								valueVisibility={this._getValueVisibility}
								translateY={translateY}
							/>
						)}
					</div>
				</div>
				<Button
					direction={DIRECTION.DOWN}
					onClick={this._moveToNextValue}
					visible={showButtons}
				/>
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
		// direction of scrolling
		const direction = Math.sign(e.deltaY);
		this._moveToNextValue(direction);
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
		return new Promise(resolve => {
			// get values for startPosition that is initial value,
			// and value when we need to reset translation to startPosition
			const { startPosition, resetPosition, initPosition } = this._scroll;
			// scrollable component top position
			const top = Math.round(
				this._valuePickerEl.getBoundingClientRect().top
			);

			if (top <= resetPosition + initPosition) {
				this.setState(
					{
						translate: startPosition,
						dragStartPosition: mousePosition - startPosition,
						animationSettings: { stiffness: 390, damping: 17 }
					},
					resolve
				);
				// only go to half of the first time array
			} else if (top - initPosition >= startPosition / 2) {
				const targetPosition = (3 / 2) * startPosition;

				this.setState(
					{
						translate: targetPosition,
						dragStartPosition: mousePosition - targetPosition,
						animationSettings: { stiffness: 390, damping: 17 }
					},
					resolve
				);
			} else {
				resolve();
			}
		});
	}

	_getValueVisibility(index, selectedIndex) {
		const difference = Math.abs(index - selectedIndex);
		const { chooseValuesNumber } = this.state;

		if (difference <= chooseValuesNumber) {
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

	_moveToNextValue(direction) {
		// check if reset position is needed to maintain illusion of infitite scroll
		this._resetScrollPosition().then(() =>
			this.setState(prevState => {
				const {
					translate,
					elementHeight,
					dragStartPosition
				} = prevState;
				// calculate new translate position and also calculate new dragStartPosition
				// to enable draging and scrolling in the same time
				const newTranslatePosition =
					translate + elementHeight * direction;

				// round position is the value is visible to the user
				const roundNewTranslatePosition = this._translateRoundPosition(
					newTranslatePosition,
					elementHeight
				);
				const roundDelta =
					newTranslatePosition - roundNewTranslatePosition;

				return {
					translate: roundNewTranslatePosition,
					dragStartPosition:
						dragStartPosition -
						elementHeight * direction +
						roundDelta,
					animationSettings: {}
				};
			})
		);
	}
}

WheelPicker.propTypes = {
	values: PropTypes.arrayOf(
		PropTypes.oneOfType([PropTypes.number, PropTypes.string])
	).isRequired,
	selectedValue: PropTypes.number,
	chooseValuesNumber: PropTypes.number,
	valueFormater: PropTypes.func,
	showButtons: PropTypes.bool
};

WheelPicker.defaultProps = {
	selectedValue: 0,
	chooseValuesNumber: 4,
	valueFormater: val => val,
	showButtons: true
};
