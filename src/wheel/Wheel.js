import React from 'react';
import PropTypes from 'prop-types';
import { Motion, spring } from 'react-motion';

export const Wheel = ({
	values,
	selectedIndex,
	onMouseDown,
	onMouseMove,
	onElementCreated,
	valueFormater,
	translateY,
	offsetHeight
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
			<div className="offset-div" style={{ marginTop: offsetHeight }} />
			{values.map((curVal, i) => (
				<div
					key={i}
					className={`value ${
						selectedIndex === i ? 'active' : 'inactive'
					}`}
				>
					{valueFormater(curVal)}
				</div>
			))}
		</div>
	);
};

Wheel.propTypes = {
	values: PropTypes.arrayOf(
		PropTypes.oneOfType([PropTypes.number, PropTypes.string])
	).isRequired,
	selectedIndex: PropTypes.number,
	valueFormater: PropTypes.func,
	onMouseDown: PropTypes.func,
	onMouseMove: PropTypes.func,
	onElementCreated: PropTypes.func,
	translateY: PropTypes.number,
	offsetHeight: PropTypes.number
};

Wheel.defaultProps = {
	selectedValue: 0,
	valueFormater: val => val,
	onMouseDown: () => {},
	onMouseMove: () => {},
	onElementCreated: () => {},
	translateY: 0,
	offsetHeight: 0
};

// TODO extract to configuration
const springSetting1 = { stiffness: 390, damping: 17 };
const createAnimationSettings = translateY => {
	return {
		translateY: spring(translateY, {
			...springSetting1
		})
	};
};

export const AnimationWheel = ({
	values,
	selectedIndex,
	onMouseDown,
	onMouseMove,
	onElementCreated,
	valueFormater,
	translateY,
	offsetHeight
}) => {
	const animationSettings = createAnimationSettings(translateY);
	return (
		<Motion style={animationSettings}>
			{({ translateY }) => (
				<Wheel
					values={values}
					onElementCreated={onElementCreated}
					onMouseDown={onMouseDown}
					onMouseMove={onMouseMove}
					selectedIndex={selectedIndex}
					valueFormater={valueFormater}
					translateY={translateY}
					offsetHeight={offsetHeight}
				/>
			)}
		</Motion>
	);
};

AnimationWheel.propTypes = {
	...Wheel.propTypes
};

AnimationWheel.defaultProps = {
	...Wheel.defaultProps
};
