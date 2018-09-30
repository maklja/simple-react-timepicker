export default class AbstractDragStrategy {
	constructor(setState) {
		this.setState = setState;
	}

	isExpanded(state, props) {
		return false;
	}

	isChooseStarted(state, props) {
		return false;
	}

	init() {
		// override in child class
		return Promise.resolve();
	}

	onDragStart() {
		// override in child class
		return Promise.resolve();
	}

	onDrag(position) {
		// override in child class
		return Promise.resolve();
	}

	onDragStop(dragContinue) {
		// override in child class
		return Promise.resolve();
	}
}
