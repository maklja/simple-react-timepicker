export class ChainState {
	constructor(setState) {
		this._setState = setState;
	}

	setState(f) {
		return new Promise((resolve, reject) => {
			try {
				this._setState(f, () => {
					const resolveResult = this._onResolve();
					resolve(resolveResult);
				});
			} catch (e) {
				reject(e);
			}
		});
	}

	executeState() {
		const nextState = this.changeState();
		if (nextState != null) {
			return this.setState(nextState);
		}

		return Promise.resolve();
	}

	changeState() {
		// abstract method than will be overriden in child class
		return null;
	}

	_onResolve() {
		return this;
	}
}
