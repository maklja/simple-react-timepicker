import React from 'react';
import PropTypes from 'prop-types';

import { infinitiveInvoke } from '../utils/helper';

import '../../assets/css/buttons/button.css';

export const DIRECTION = {
	UP: 1,
	DOWN: -1
};

const SPACEBAR = ' ';

export default class DefaultButton extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			buttonPressed: false
		};
		this._cancelPress = null;

		this._onMouseDown = this._onMouseDown.bind(this);
		this._clearPressedDelay = this._clearPressedDelay.bind(this);
		this._onKeyDown = this._onKeyDown.bind(this);
	}

	render() {
		const { direction, visible, disabled } = this.props;
		const directionClass = direction === DIRECTION.UP ? 'up' : 'down';
		const disabledClass = disabled ? 'disabled' : '';
		const visibilityClass = visible ? '' : 'hidden';

		return (
			<div className={`button ${visibilityClass} ${disabledClass}`}>
				<div
					tabIndex={disabled ? '' : '0'}
					onKeyDown={this._onKeyDown}
					onMouseDown={this._onMouseDown}
					onMouseUp={this._clearPressedDelay}
					onMouseLeave={this._clearPressedDelay}
					onKeyUp={this._clearPressedDelay}
				>
					<div className={`arrow ${directionClass}`} />
				</div>
			</div>
		);
	}

	componentWillUnmount() {
		if (this._cancelPress != null) {
			this._cancelPress();
			this._cancelPress = null;
		}
	}

	_onKeyDown(e) {
		if (this.isDisabled()) {
			return;
		}

		// TODO move to configuration
		if (e.key === 'Enter' || e.key === SPACEBAR) {
			this.setState(
				{
					buttonPressed: true
				},
				() => this._pressedDelay()
			);
		}
	}

	_onMouseDown() {
		if (this.isDisabled()) {
			return;
		}

		this.setState(
			{
				buttonPressed: true
			},
			() => this._pressedDelay()
		);
	}

	_clearPressedDelay() {
		if (this.isDisabled()) {
			return;
		}

		this.setState(
			{
				buttonPressed: false
			},
			() => {
				if (this._cancelPress != null) {
					this._cancelPress();
					this._cancelPress = null;
				}
			}
		);
	}

	_pressedDelay() {
		const { direction, onClick } = this.props;

		this._cancelPress = infinitiveInvoke(
			onClick,
			() => this.state.buttonPressed,
			direction
		);
	}

	isDisabled() {
		return this.props.disabled;
	}
}

DefaultButton.propTypes = {
	direction: PropTypes.oneOf([DIRECTION.DOWN, DIRECTION.UP]),
	visible: PropTypes.bool,
	onClick: PropTypes.func,
	disabled: PropTypes.bool
};

DefaultButton.defaultProps = {
	direction: DIRECTION.UP,
	visible: true,
	onClick: () => {},
	disabled: false
};
