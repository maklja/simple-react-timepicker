import React from 'react';
import PropTypes from 'prop-types';

import Button, { DIRECTION } from '../buttons/DefaultButton';
import WheelPickerCore from './WheelPickerCore';

export default class WheelPicker extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			dragStarted: false
		};

		this._wheelMove = this._wheelMove.bind(this);
		this._onWheel = this._onWheel.bind(this);
		this._onKeyDown = this._onKeyDown.bind(this);
		this._onDragStarted = this._onDragStarted.bind(this);
		this._onDragStoped = this._onDragStoped.bind(this);
	}

	render() {
		const {
			valueFormater,
			enableAnimation,
			showButtons,
			disabled,
			values,
			selectedIndex,
			onChange,
			name,
			expandSize,
			alwaysExpand
		} = this.props;
		const { dragStarted } = this.state;

		return (
			<div>
				<Button
					disabled={disabled}
					onClick={this._wheelMove}
					visible={
						showButtons &&
						dragStarted === false &&
						alwaysExpand === false
					}
				/>
				<WheelPickerCore
					name={name}
					ref={el => (this._wheelPicker = el)}
					values={values}
					selectedIndex={selectedIndex}
					extendValuesTime={expandSize}
					enableAnimation={enableAnimation}
					valueFormater={valueFormater}
					onWheel={this._onWheel}
					disabled={disabled}
					onKeyDown={this._onKeyDown}
					onChange={onChange}
					onDragStarted={this._onDragStarted}
					onDragStoped={this._onDragStoped}
					alwaysExpand={alwaysExpand}
				/>
				<Button
					disabled={disabled}
					direction={DIRECTION.DOWN}
					onClick={this._wheelMove}
					visible={
						showButtons &&
						dragStarted === false &&
						alwaysExpand === false
					}
				/>
			</div>
		);
	}

	collapse() {
		this._wheelPicker.collapse();
	}

	_wheelMove(direction) {
		this._wheelPicker.moveToNextValue(direction);
	}

	_onKeyDown(e) {
		if (e.key === 'ArrowUp') {
			this._wheelMove(DIRECTION.UP);
			e.preventDefault();
		} else if (e.key === 'ArrowDown') {
			this._wheelMove(DIRECTION.DOWN);
			e.preventDefault();
		}
	}

	// event is triggered on mouse wheel
	_onWheel(e) {
		e.preventDefault();
		e.stopPropagation();
		// direction of scrolling
		const direction = Math.sign(e.deltaY);
		this._wheelMove(direction);
	}

	_onDragStarted() {
		this.setState(
			{
				dragStarted: true
			},
			() => {
				const { name, onExpand } = this.props;

				onExpand(name);
			}
		);
	}

	_onDragStoped() {
		this.setState({
			dragStarted: false
		});
	}
}

WheelPicker.propTypes = {
	name: PropTypes.string,
	values: PropTypes.arrayOf(
		PropTypes.oneOfType([PropTypes.number, PropTypes.string])
	).isRequired,
	selectedIndex: PropTypes.number,
	expandSize: PropTypes.number,
	valueFormater: PropTypes.func,
	showButtons: PropTypes.bool,
	alwaysExpand: PropTypes.bool,
	enableAnimation: PropTypes.bool,
	disabled: PropTypes.bool,
	onChange: PropTypes.func,
	onExpand: PropTypes.func
};

WheelPicker.defaultProps = {
	name: '',
	selectedIndex: 0,
	expandSize: 4,
	valueFormater: val => val,
	showButtons: true,
	alwaysExpand: false,
	enableAnimation: true,
	disabled: false,
	onChange: () => {},
	onExpand: () => {}
};
