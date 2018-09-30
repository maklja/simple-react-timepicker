import InitState from '../default/InitState';
import { checkInsufficientSpace } from '../../calc_func';

export default class AlwaysExpandInitState extends InitState {
	changeState() {
		return (prevState, props) => {
			const nextState = super.changeState()(prevState, props);

			const { alwaysExpand, maintainSelectedValuePosition } = props;
			const { values, expandSize } = prevState;

			const insufficientSpaceState =
				alwaysExpand && maintainSelectedValuePosition
					? checkInsufficientSpace(
							this._wheelElementHolder.getBoundingClientRect(),
							nextState.selectedIndex,
							nextState.elementHeight,
							values,
							expandSize
					  )
					: {};

			return {
				...nextState,
				...insufficientSpaceState,
				prepairChoose: true
			};
		};
	}
}
