import React from 'react';
import PropTypes from 'prop-types';
import dateformat from 'dateformat';

import TimePicker from './TimePicker';
import { isFunction, roundDate } from '../utils/helper';

import '../../assets/css/time_picker/time_picker_input.css';

const BLUR_TIMEOUT = 200; // ms

export default class TimePickerInput extends React.Component {
	constructor(props) {
		super(props);

		const {
			defaultValue,
			value,
			stepHour,
			stepMinute,
			stepSecond,
			stepMilliseconds
		} = props;
		const dateValue = roundDate(
			value || defaultValue,
			stepHour,
			stepMinute,
			stepSecond,
			stepMilliseconds
		);

		this.state = {
			value: dateValue,
			formatedValue: this._formatDate(dateValue),
			visible: false
		};

		this._onTimePickerChange = this._onTimePickerChange.bind(this);
		this._onChange = this._onChange.bind(this);
		this._onFocus = this._onFocus.bind(this);
		this._onBlur = this._onBlur.bind(this);
		this._hideTimePicker = this._hideTimePicker.bind(this);
		this._onClick = this._onClick.bind(this);
	}

	render() {
		const { readOnly, disabled, useOverlay } = this.props;
		const { formatedValue, visible, value } = this.state;

		return (
			<div className={`time-picker-input ${useOverlay ? 'overlay' : ''}`}>
				<div>
					<input
						type="text"
						readOnly={readOnly}
						disabled={disabled}
						value={formatedValue}
						onChange={this._onChange}
						onFocus={this._onFocus}
						onClick={this._onClick}
					/>
				</div>
				{visible ? (
					<div className="holder">
						<TimePicker
							{...this.props}
							value={value}
							onFocus={this._onFocus}
							onBlur={this._onBlur}
							onValueChange={this._onTimePickerChange}
						/>
					</div>
				) : (
					''
				)}
			</div>
		);
	}

	_onClick(e) {
		e.stopPropagation();
	}

	_onFocus() {
		clearTimeout(this._removeFocus);
		this.setState({
			visible: true
		});
	}

	_onBlur() {
		this._removeFocus = setTimeout(() => {
			this._hideTimePicker();
			this._removeFocus = null;
		}, BLUR_TIMEOUT);
	}

	_onChange(e) {
		this.setState({
			formatedValue: e.target.value
		});
	}

	_onTimePickerChange(curDateTime, id) {
		this.setState({
			value: curDateTime,
			formatedValue: this._formatDate(curDateTime)
		});
	}

	_formatDate(date) {
		const { defaultFormat, use12Hours } = this.props;
		return dateformat(
			date,
			isFunction(defaultFormat)
				? defaultFormat(use12Hours)
				: defaultFormat
		);
	}

	_hideTimePicker() {
		this.setState({
			visible: false
		});
	}

	componentWillMount() {
		window.addEventListener('click', this._hideTimePicker);
	}

	componentWillUnmount() {
		window.removeEventListener('click', this._hideTimePicker);
		clearTimeout(this._removeFocus);
	}

	componentDidUpdate(prevProps, prevState) {
		const { visible, value } = this.state;
		const { onOpen, onClose, id, onValueChange } = this.props;

		if (prevState.visible !== visible) {
			visible ? onOpen(id) : onClose(id);
		}

		if (prevState.value.getTime() !== value.getTime()) {
			onValueChange(value, id);
		}
	}
}

TimePickerInput.propTypes = {
	...TimePicker.propTypes,
	defaultFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
	readOnly: PropTypes.bool,
	useOverlay: PropTypes.bool,
	onOpen: PropTypes.func,
	onClose: PropTypes.func
};

TimePickerInput.defaultProps = {
	...TimePicker.defaultProps,
	defaultFormat: use12HourFormat =>
		use12HourFormat ? 'hh:MM:ss.l TT' : 'HH:MM:ss.l',
	useOverlay: false,
	onOpen: () => {},
	onClose: () => {}
};
