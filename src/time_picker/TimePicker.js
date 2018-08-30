import React from 'react';
import PropTypes from 'prop-types';

import WheelPicker from '../wheel/WheelPicker';

import './style.css';

const meridiems = ['AM', 'PM'];

const generateArrayValues = (maxValue, step, startValue = 0) => {
	const values = [];
	for (let i = startValue; i < maxValue; i += step) {
		values.push(i);
	}

	return values;
};

const timeFormater = val => {
	let s = val + '';
	while (s.length < 2) s = '0' + s;

	return s;
};

export default class TimePicker extends React.Component {
	render() {
		const { use12Hours, stepHour, stepMinute, stepSecond } = this.props;

		return (
			<div className="time-picker">
				<div className="cell">
					<WheelPicker
						values={generateArrayValues(
							use12Hours ? 13 : 24,
							stepHour,
							use12Hours ? 1 : 0
						)}
						valueFormater={timeFormater}
					/>
				</div>
				<div className="cell split">:</div>
				<div className="cell">
					<WheelPicker
						values={generateArrayValues(60, stepMinute)}
						valueFormater={timeFormater}
					/>
				</div>
				<div className="cell split">:</div>
				<div className="cell">
					<WheelPicker
						values={generateArrayValues(60, stepSecond)}
						valueFormater={timeFormater}
					/>
				</div>
				<div className="cell split">:</div>
				{use12Hours ? (
					<div className="cell">
						<WheelPicker
							values={meridiems}
							valueFormater={timeFormater}
						/>
					</div>
				) : (
					''
				)}
			</div>
		);
	}
}

TimePicker.propTypes = {
	use12Hours: PropTypes.bool,
	stepHour: PropTypes.number,
	stepMinute: PropTypes.number,
	stepSecond: PropTypes.number
};

TimePicker.defaultProps = {
	use12Hours: false,
	stepHour: 1,
	stepMinute: 1,
	stepSecond: 1
};
