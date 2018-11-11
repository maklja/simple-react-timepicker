import React from 'react';
import PropTypes from 'prop-types';
import dateformat from 'dateformat';

import TimePicker from './TimePicker';
import TimeParser from '../utils/parser/TimeParser';
import {
	roundDate,
	themeClassName,
	defaultTimeFormater,
	isFunction
} from '../utils/helper';

import '../../assets/scss/time_picker_input/index.scss';

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
			visible: false,
			isFocused: false
		};

		this._timeParser = new TimeParser(this._getTimeFormat());

		this._onTimePickerChange = this._onTimePickerChange.bind(this);
		this._onChange = this._onChange.bind(this);
		this._onFocus = this._onFocus.bind(this);
		this._onBlur = this._onBlur.bind(this);
		this._hideTimePicker = this._hideTimePicker.bind(this);
		this._onClick = this._onClick.bind(this);
	}

	render() {
		const { readOnly, disabled, useOverlay, theme } = this.props;
		const { formatedValue, visible, value } = this.state;

		const themeClass = themeClassName(theme);
		return (
			<div className={`${themeClass}`}>
				<div
					className={`time-picker-input ${
						useOverlay ? 'overlay' : ''
					}`}
				>
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
								// don't put theme class on child component too
								theme={null}
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
			</div>
		);
	}

	_onClick(e) {
		e.stopPropagation();

		this.setState(state => {
			if (state.visible) {
				return null;
			}

			return {
				visible: true
			};
		});
	}

	_onFocus(e) {
		e.stopPropagation();

		clearTimeout(this._removeFocus);
		this.setState({
			visible: true,
			isFocused: true
		});
	}

	_onBlur() {
		this._removeFocus = setTimeout(() => {
			this._hideTimePicker();
			this._removeFocus = null;
		}, BLUR_TIMEOUT);
	}

	_onChange(e) {
		const target = e.target;
		const newTimeValueStr = target.value;
		const selectionPosition = target.selectionStart;

		this.setState(
			(prevState, props) => {
				const { value } = prevState;
				const {
					stepHour,
					stepMinute,
					stepSecond,
					stepMilliseconds
				} = props;

				const newDate = roundDate(
					this._timeParser.extractAsDate(newTimeValueStr, value),
					stepHour,
					stepMinute,
					stepSecond,
					stepMilliseconds
				);

				return {
					formatedValue:
						newDate != null
							? this._formatDate(newDate)
							: newTimeValueStr,
					value: newDate || value,
					visible: false
				};
			},
			() => {
				target.selectionStart = target.selectionEnd = selectionPosition;
			}
		);
	}

	_onTimePickerChange(curDateTime, id) {
		this.setState({
			value: curDateTime,
			formatedValue: this._formatDate(curDateTime)
		});
	}

	_formatDate(date) {
		return dateformat(date, this._getTimeFormat());
	}

	_getTimeFormat() {
		const {
			defaultFormat,
			use12Hours,
			showHour,
			showMinutes,
			showSeconds,
			showMilliseconds
		} = this.props;

		return isFunction(defaultFormat)
			? defaultFormat({
					showHour,
					showMinutes,
					showSeconds,
					showMilliseconds,
					use12Hours
			  })
			: defaultFormat;
	}

	_hideTimePicker() {
		this.setState(state => {
			return {
				formatedValue: this._formatDate(state.value),
				visible: false,
				isFocused: false
			};
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
	defaultFormat: defaultTimeFormater,
	useOverlay: false,
	onOpen: () => {},
	onClose: () => {}
};
