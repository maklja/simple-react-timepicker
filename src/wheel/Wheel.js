import React from 'react';
import PropTypes from 'prop-types';
import { Motion, spring } from 'react-motion';

export const Wheel = ({
	values,
	selectedIndex,
	onMouseDown,
	onMouseMove,
	onTouchStart,
	onTouchMove,
	onElementCreated,
	valueFormater,
	translate,
	offsetHeight
}) => {
	return (
		<div
			ref={onElementCreated}
			onTouchStart={onTouchStart}
			onTouchMove={onTouchMove}
			onMouseDown={onMouseDown}
			onMouseMove={onMouseMove}
			style={{
				transform: `translateY(${translate}px)`,
				touchAction: 'none' // TODO move
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
	translate: PropTypes.number,
	offsetHeight: PropTypes.number,
	onTouchStart: PropTypes.func,
	onTouchMove: PropTypes.func
};

Wheel.defaultProps = {
	selectedValue: 0,
	valueFormater: val => val,
	onMouseDown: () => {},
	onMouseMove: () => {},
	onElementCreated: () => {},
	translate: 0,
	offsetHeight: 0,
	onTouchStart: () => {},
	onTouchMove: () => {}
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
	onTouchStart,
	onElementCreated,
	valueFormater,
	translate,
	offsetHeight
}) => {
	const animationSettings = createAnimationSettings(translate);
	return (
		<Motion style={animationSettings}>
			{({ translateY }) => (
				<Wheel
					values={values}
					onElementCreated={onElementCreated}
					onMouseDown={onMouseDown}
					onMouseMove={onMouseMove}
					onTouchStart={onTouchStart}
					selectedIndex={selectedIndex}
					valueFormater={valueFormater}
					translate={translateY}
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

export const WheelPickerBody = ({
	values,
	selectedIndex,
	valueFormater,
	onMouseDown,
	onMouseMove,
	onMouseUp,
	onMouseLeave,
	onWheel,
	onTouchStart,
	onTouchMove,
	onTouchEnd,
	onTouchCancel,
	onElementCreated,
	translate,
	offsetHeight,
	elementHeight,
	disabled,
	animation,
	onKeyDown,
	currentValueStyle
}) => {
	return (
		<div
			style={{
				maxHeight: `${elementHeight}px`,
				height: `${elementHeight}px`
			}}
			tabIndex={disabled ? '' : '0'}
			className="wheel-picker"
			onKeyDown={onKeyDown}
			onMouseUp={onMouseUp}
			onMouseLeave={onMouseLeave}
			onWheel={onWheel}
			onTouchEnd={onTouchEnd}
			onTouchCancel={onTouchCancel}
		>
			<div
				className="current-value"
				style={{
					minHeight: `${elementHeight}px`,
					...currentValueStyle
				}}
			>
				{animation ? (
					<AnimationWheel
						values={values}
						onElementCreated={onElementCreated}
						onTouchStart={onTouchStart}
						onTouchMove={onTouchMove}
						onMouseDown={onMouseDown}
						onMouseMove={onMouseMove}
						selectedIndex={selectedIndex}
						valueFormater={valueFormater}
						translate={translate}
						offsetHeight={offsetHeight}
					/>
				) : (
					<Wheel
						values={values}
						onElementCreated={onElementCreated}
						onTouchStart={onTouchStart}
						onTouchMove={onTouchMove}
						onMouseDown={onMouseDown}
						onMouseMove={onMouseMove}
						selectedIndex={selectedIndex}
						valueFormater={valueFormater}
						translate={translate}
						offsetHeight={offsetHeight}
					/>
				)}
			</div>
		</div>
	);
};

WheelPickerBody.propTypes = {
	...Wheel.propTypes,
	onMouseUp: PropTypes.func,
	elementHeight: PropTypes.number,
	disabled: PropTypes.bool,
	animation: PropTypes.bool,
	onKeyDown: PropTypes.func,
	onMouseLeave: PropTypes.func,
	onWheel: PropTypes.func,
	currentValueStyle: PropTypes.object,
	onTouchEnd: PropTypes.func,
	onTouchCancel: PropTypes.func
};

WheelPickerBody.defaultProps = {
	...Wheel.defaultProps,
	onMouseUp: () => {},
	elementHeight: 0,
	disabled: false,
	animation: true,
	onKeyDown: () => {},
	onMouseLeave: () => {},
	onWheel: () => {},
	currentValueStyle: {},
	onTouchEnd: () => {},
	onTouchCancel: () => {}
};
