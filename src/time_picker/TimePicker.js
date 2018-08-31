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
		const {
			use12Hours,
			stepHour,
			stepMinute,
			stepSecond,
			stepMilliseconds,
			showHour,
			showMinutes,
			showSeconds,
			showMilliseconds,
			disableHour,
			disableMinutes,
			disableSeconds,
			disableMilliseconds
		} = this.props;

		return (
			<div className="time-picker">
				{showHour ? (
					<div className="cell">
						<WheelPicker
							values={generateArrayValues(
								use12Hours ? 13 : 24,
								stepHour,
								use12Hours ? 1 : 0
							)}
							valueFormater={timeFormater}
							disabled={disableHour}
						/>
					</div>
				) : (
					''
				)}
				{showHour ? <div className="cell split">:</div> : ''}

				{showMinutes ? (
					<div className="cell">
						<WheelPicker
							values={generateArrayValues(60, stepMinute)}
							valueFormater={timeFormater}
							disable={disableMinutes}
						/>
					</div>
				) : (
					''
				)}
				{showMinutes ? <div className="cell split">:</div> : ''}

				{showSeconds ? (
					<div className="cell">
						<WheelPicker
							values={generateArrayValues(60, stepSecond)}
							valueFormater={timeFormater}
							disabled={disableSeconds}
						/>
					</div>
				) : (
					''
				)}
				{showMilliseconds ? <div className="cell split">.</div> : ''}

				{showMilliseconds ? (
					<div className="cell">
						<WheelPicker
							values={generateArrayValues(1000, stepMilliseconds)}
							valueFormater={timeFormater}
							disabled={disableMilliseconds}
						/>
					</div>
				) : (
					''
				)}

				{use12Hours && showHour ? (
					<div className="cell">
						<WheelPicker
							values={meridiems}
							valueFormater={timeFormater}
							disabled={disableHour}
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
	stepSecond: PropTypes.number,
	stepMilliseconds: PropTypes.number,
	showHour: PropTypes.bool,
	showMinutes: PropTypes.bool,
	showSeconds: PropTypes.bool,
	showMilliseconds: PropTypes.bool,
	disableHour: PropTypes.bool,
	disableMinutes: PropTypes.bool,
	disableSeconds: PropTypes.bool,
	disableMilliseconds: PropTypes.bool
};

TimePicker.defaultProps = {
	use12Hours: false,
	stepHour: 1,
	stepMinute: 1,
	stepSecond: 1,
	stepMilliseconds: 1,
	showHour: true,
	showMinutes: true,
	showSeconds: true,
	showMilliseconds: false,
	disableHour: true,
	disableMinutes: false,
	disableSeconds: false,
	disableMilliseconds: false
};
