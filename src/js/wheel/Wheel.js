import React from 'react';
import PropTypes from 'prop-types';
import { Motion, spring } from 'react-motion';
import AbstractWheelValueModifier from './value_modifiers/AbstractWheelValueModifier';

export const Wheel = React.forwardRef(
	(
		{
			values,
			onMouseDown,
			onMouseMove,
			onTouchStart,
			onTouchMove,
			translate,
			offsetHeight,
			disabled,
			valueModifier
		},
		ref
	) => {
		const disabledClass = disabled ? 'disabled' : '';
		return (
			<div
				ref={ref}
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onMouseDown={onMouseDown}
				onMouseMove={onMouseMove}
				tabIndex={disabled ? '' : '0'}
				style={{
					transform: `translateY(${translate}px)`
				}}
				className="wheel"
			>
				<div
					className="offset-div"
					style={{ marginTop: offsetHeight }}
				/>
				{values.map((curVal, i) => {
					const isSelected = valueModifier.isSelected(curVal, i);
					const valueStyles = valueModifier.getValueStyles(curVal, i);
					const formatedValue = valueModifier.formatValue(curVal, i);

					return (
						<div
							key={i}
							className={`value ${
								isSelected ? 'active' : 'inactive'
							} ${disabledClass}`}
							style={valueStyles}
						>
							{formatedValue}
						</div>
					);
				})}
			</div>
		);
	}
);

Wheel.propTypes = {
	values: PropTypes.arrayOf(
		PropTypes.oneOfType([PropTypes.number, PropTypes.string])
	).isRequired,
	onMouseDown: PropTypes.func,
	onMouseMove: PropTypes.func,
	translate: PropTypes.number,
	offsetHeight: PropTypes.number,
	onTouchStart: PropTypes.func,
	onTouchMove: PropTypes.func,
	disabled: PropTypes.bool,
	valueModifier: PropTypes.instanceOf(AbstractWheelValueModifier).isRequired
};

Wheel.defaultProps = {
	onMouseDown: () => {},
	onMouseMove: () => {},
	translate: 0,
	offsetHeight: 0,
	onTouchStart: () => {},
	onTouchMove: () => {},
	disabled: false
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

export const AnimationWheel = props => {
	const { translate, setRef } = props;
	const animationSettings = createAnimationSettings(translate);

	return (
		<Motion style={animationSettings}>
			{({ translateY }) => (
				<Wheel {...props} ref={setRef} translate={translateY} />
			)}
		</Motion>
	);
};

AnimationWheel.propTypes = {
	...Wheel.propTypes,
	setRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
};

AnimationWheel.defaultProps = {
	...Wheel.defaultProps
};

export const WheelPickerBody = ({
	values,
	onMouseDown,
	onMouseMove,
	onMouseUp,
	onMouseLeave,
	onWheel,
	onTouchStart,
	onTouchMove,
	onTouchEnd,
	onTouchCancel,
	translate,
	offsetHeight,
	elementHeight,
	disabled,
	animation,
	onKeyDown,
	currentValueStyle,
	setRef,
	valueModifier
}) => {
	return (
		<div
			style={{
				height: `${elementHeight}px`
			}}
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
					...currentValueStyle
				}}
			>
				{animation ? (
					<AnimationWheel
						setRef={setRef}
						values={values}
						onTouchStart={onTouchStart}
						onTouchMove={onTouchMove}
						onMouseDown={onMouseDown}
						onMouseMove={onMouseMove}
						translate={translate}
						offsetHeight={offsetHeight}
						disabled={disabled}
						valueModifier={valueModifier}
					/>
				) : (
					<Wheel
						ref={setRef}
						values={values}
						onTouchStart={onTouchStart}
						onTouchMove={onTouchMove}
						onMouseDown={onMouseDown}
						onMouseMove={onMouseMove}
						translate={translate}
						offsetHeight={offsetHeight}
						disabled={disabled}
						valueModifier={valueModifier}
					/>
				)}
			</div>
		</div>
	);
};

WheelPickerBody.propTypes = {
	...Wheel.propTypes,
	setRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
	onMouseUp: PropTypes.func,
	elementHeight: PropTypes.number,
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
	animation: true,
	onKeyDown: () => {},
	onMouseLeave: () => {},
	onWheel: () => {},
	currentValueStyle: {},
	onTouchEnd: () => {},
	onTouchCancel: () => {}
};

export default WheelPickerBody;
