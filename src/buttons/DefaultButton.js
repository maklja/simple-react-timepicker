import React from 'react';
import PropTypes from 'prop-types';

const holdButtonDownClickDelay = 150; // ms

export const DIRECTION = {
	UP: 1,
	DOWN: -1
};

export default class DefaultButton extends React.Component {
	constructor(props) {
		super(props);

		this.state = { buttonPressed: false };

		this._onMouseDown = this._onMouseDown.bind(this);
		this._stopMouseClick = this._stopMouseClick.bind(this);
	}

	render() {
		const { direction, visible } = this.props;
		const directionClass = direction === DIRECTION.UP ? 'up' : 'down';
		const visibilityClass = visible ? '' : 'hidden';

		return (
			<div
				className={`button ${visibilityClass}`}
				onMouseDown={this._onMouseDown}
				onMouseUp={this._stopMouseClick}
				onMouseLeave={this._stopMouseClick}
			>
				<div className={`arrow ${directionClass}`} />
			</div>
		);
	}

	_onMouseDown() {
		this.setState(
			{
				buttonPressed: true
			},
			() => this._mouseClickedDelay()
		);
	}

	_stopMouseClick() {
		this.setState(
			{
				buttonPressed: false
			},
			() => {
				clearTimeout(this._mouseDownTimeout);
				this._mouseDownTimeout = null;
			}
		);
	}

	_mouseClickedDelay() {
		const { direction, onClick } = this.props;

		onClick(direction);
		this._mouseDownTimeout = setTimeout(() => {
			if (this.state.buttonPressed) {
				this._mouseClickedDelay();
			}
		}, holdButtonDownClickDelay);
	}
}

DefaultButton.propTypes = {
	direction: PropTypes.oneOf([DIRECTION.DOWN, DIRECTION.UP]),
	visible: PropTypes.bool,
	onClick: PropTypes.func
};

DefaultButton.defaultProps = {
	direction: DIRECTION.UP,
	visible: true,
	onClick: () => {}
};
