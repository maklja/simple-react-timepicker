import React from 'react';
import PropTypes from 'prop-types';

import { generateArrayValues, timeFormater, roundDate } from '../utils/helper';
import WheelPicker from '../wheel/WheelPicker';

import '../../assets/css/time_picker/time_picker.css';

const MERIDIEMS = { AM: 'AM', PM: 'PM' };
const { AM, PM } = MERIDIEMS;

export default class TimePicker extends React.Component {
	constructor(props) {
		super(props);

		const {
			defaultValue,
			value,
			use12Hours,
			stepHour,
			stepMinute,
			stepSecond,
			stepMilliseconds
		} = props;
		const dateValue = value || defaultValue;

		this.state = {
			value: roundDate(
				dateValue,
				stepHour,
				stepMinute,
				stepSecond,
				stepMilliseconds
			),
			meridiem: use12Hours ? (dateValue.getHours() > 12 ? PM : AM) : null
		};

		// TODO problem if we hide during next render??
		this._wheelComp = {};

		this._onValueChange = this._onValueChange.bind(this);
		this._onWheelExpended = this._onWheelExpended.bind(this);
	}

	render() {
		const {
			alwaysExpand,
			id,
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
			disableMilliseconds,
			onFocus,
			onBlur
		} = this.props;

		const { value } = this.state;

		let hour = value.getHours(),
			minute = value.getMinutes(),
			second = value.getSeconds(),
			millisecond = value.getMilliseconds(),
			meridiem = null;

		if (use12Hours) {
			meridiem = hour > 12 ? 1 : 0;
			hour = hour % 12;
			hour = hour || 12;
			hour = Math.round(hour / stepHour) - 1;
		}

		minute = Math.round(minute / stepMinute);
		second = Math.round(second / stepSecond);
		millisecond = Math.round(millisecond / stepMilliseconds);

		return (
			<div
				id={id}
				className="time-picker"
				onFocus={onFocus}
				onBlur={onBlur}
				onClick={e => e.stopPropagation()}
			>
				{showHour ? (
					<div className="cell">
						<WheelPicker
							ref={el => (this._wheelComp.hour = el)}
							name="hour"
							values={generateArrayValues(
								use12Hours ? 13 : 24,
								stepHour,
								use12Hours ? 1 : 0
							)}
							valueFormater={timeFormater}
							disabled={disableHour}
							onChange={this._onValueChange}
							selectedIndex={hour}
							onExpand={this._onWheelExpended}
							alwaysExpand={alwaysExpand}
						/>
					</div>
				) : (
					''
				)}
				{showHour ? <div className="cell split">:</div> : ''}

				{showMinutes ? (
					<div className="cell">
						<WheelPicker
							ref={el => (this._wheelComp.minute = el)}
							name="minute"
							values={generateArrayValues(60, stepMinute)}
							valueFormater={timeFormater}
							disabled={disableMinutes}
							onChange={this._onValueChange}
							selectedIndex={minute}
							onExpand={this._onWheelExpended}
							alwaysExpand={alwaysExpand}
						/>
					</div>
				) : (
					''
				)}
				{showMinutes ? <div className="cell split">:</div> : ''}

				{showSeconds ? (
					<div className="cell">
						<WheelPicker
							ref={el => (this._wheelComp.second = el)}
							name="second"
							values={generateArrayValues(60, stepSecond)}
							valueFormater={timeFormater}
							disabled={disableSeconds}
							onChange={this._onValueChange}
							selectedIndex={second}
							onExpand={this._onWheelExpended}
							alwaysExpand={alwaysExpand}
						/>
					</div>
				) : (
					''
				)}
				{showMilliseconds ? <div className="cell split">.</div> : ''}

				{showMilliseconds ? (
					<div className="cell">
						<WheelPicker
							ref={el => (this._wheelComp.millisecond = el)}
							name="millisecond"
							values={generateArrayValues(1000, stepMilliseconds)}
							valueFormater={timeFormater}
							disabled={disableMilliseconds}
							onChange={this._onValueChange}
							selectedIndex={millisecond}
							onExpand={this._onWheelExpended}
							alwaysExpand={alwaysExpand}
						/>
					</div>
				) : (
					''
				)}
				{use12Hours && showHour ? (
					<div className="cell split"> </div>
				) : (
					''
				)}
				{use12Hours && showHour ? (
					<div className="cell">
						<WheelPicker
							ref={el => (this._wheelComp.meridiem = el)}
							name="meridiem"
							values={Object.values(MERIDIEMS)}
							valueFormater={timeFormater}
							disabled={disableHour}
							onChange={this._onValueChange}
							selectedIndex={meridiem}
							onExpand={this._onWheelExpended}
							alwaysExpand={alwaysExpand}
						/>
					</div>
				) : (
					''
				)}
			</div>
		);
	}

	_onWheelExpended(name) {
		for (const curCompName in this._wheelComp) {
			if (curCompName !== name) {
				this._wheelComp[curCompName].collapse();
			}
		}
	}

	_onValueChange(newValue, name) {
		this.setState(prevState => {
			const { value, meridiem } = prevState;
			const dateValue = value;
			const newDateValue = new Date(dateValue.getTime());
			let newMeridiem = meridiem;

			switch (name) {
				case 'hour':
					if (meridiem === AM) {
						newDateValue.setHours(newValue === 12 ? 0 : newValue);
					} else if (meridiem === PM) {
						// Date object supports only 24 hour format, so in case user
						// select PM we need to add 12 hours to selected hours
						newDateValue.setHours(
							newValue === 12 ? 12 : newValue + 12
						);
					} else {
						newDateValue.setHours(newValue);
					}
					break;
				case 'minute':
					newDateValue.setMinutes(newValue);
					break;
				case 'second':
					newDateValue.setSeconds(newValue);
					break;
				case 'millisecond':
					newDateValue.setMilliseconds(newValue);
					break;
				case 'meridiem':
					if (meridiem !== newValue) {
						newDateValue.setHours(
							newDateValue.getHours() +
								(newValue === PM ? 12 : -12)
						);
						newMeridiem = newValue;
					}
					break;
				default:
					throw new Error(
						`Unsupported case ${name} on value change.`
					);
			}

			return {
				value: newDateValue,
				meridiem: newMeridiem
			};
		});
	}

	componentWillUnmount() {
		this._wheelComp = {};
	}

	componentDidUpdate(prevProps, prevState) {
		const { value, meridiem } = this.state;

		if (
			value.getTime() !== prevState.value.getTime() ||
			meridiem !== prevState.meridiem
		) {
			const { onValueChange, id } = this.props;
			onValueChange(value, id);
		}
	}
}

TimePicker.propTypes = {
	alwaysExpand: PropTypes.bool,
	id: PropTypes.string,
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
	disableMilliseconds: PropTypes.bool,
	defaultValue: PropTypes.instanceOf(Date),
	value: PropTypes.instanceOf(Date),
	onValueChange: PropTypes.func,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func
};

TimePicker.defaultProps = {
	alwaysExpand: false,
	id: null,
	use12Hours: false,
	stepHour: 1,
	stepMinute: 1,
	stepSecond: 1,
	stepMilliseconds: 1,
	showHour: true,
	showMinutes: true,
	showSeconds: true,
	showMilliseconds: false,
	disableHour: false,
	disableMinutes: false,
	disableSeconds: false,
	disableMilliseconds: false,
	defaultValue: new Date(),
	value: null,
	onValueChange: () => {},
	onFocus: () => {},
	onBlur: () => {}
};
