import HourValidator from './validator/HourValidator';
import MinSecValidator from './validator/MinSecValidator';
import MillisecondValidator from './validator/MillisecondValidator';

const regexRules = {
	tt: '(am|pm)',
	t: '(a|p)',
	TT: '(AM|PM)',
	T: '(A|P)',
	hh: '\\d{2}',
	h: '\\d{1,2}',
	HH: '\\d{2}',
	H: '\\d{1,2}',
	MM: '\\d{2}',
	M: '\\d{1,2}',
	ss: '\\d{2}',
	s: '\\d{1,2}',
	l: '\\d{3}',
	L: '\\d{2}'
};

const parseUnsafeTokens = ['h', 'H', 'M', 's'];
const regexRulesMeridiem = ['tt', 't', 'TT', 'T'];

const parseIntOrDefault = (numberStr, defaultValue) => {
	const parsedNumber = parseInt(numberStr);

	return Number.isNaN(parsedNumber) === false ? parsedNumber : defaultValue;
};

export default class TimeParser {
	get formatParts() {
		return this._formatParts;
	}

	get formatRegex() {
		return this._formatRegex;
	}

	constructor(format) {
		this._format = TimeParser._removeSpaces(format);
		this._formatParts = TimeParser.parseFormat(this._format);
		this._formatRegex = TimeParser.createTimeFormatRegex(this._formatParts);
		if (TimeParser.validateFormat(this._formatParts) === false) {
			throw new Error(
				'Unsafe time format detected. Use separators between time parts.'
			);
		}

		this._validators = [
			new HourValidator(),
			new MinSecValidator(),
			new MillisecondValidator()
		];
	}

	getValidator(type) {
		for (const curValidator of this._validators) {
			if (curValidator.isTypeSupported(type)) {
				return curValidator;
			}
		}

		return null;
	}

	checkFormat(time) {
		time = TimeParser._removeSpaces(time);

		// RegExp is stateful, so reset index to 0
		this._formatRegex.lastIndex = 0;
		return this._formatRegex.test(time);
	}

	extractAsDate(time, defaultDate = new Date()) {
		const extractedTime = this.extractTime(time);

		if (extractedTime.isInvalid === false) {
			const newDateValue = new Date(defaultDate.getTime());
			const {
				hour,
				minute,
				second,
				millisecond,
				meridiem
			} = extractedTime;
			newDateValue.setHours(
				meridiem === 'PM'
					? parseIntOrDefault(hour, newDateValue.getHours()) + 12
					: parseIntOrDefault(hour, newDateValue.getHours()),
				parseIntOrDefault(minute, newDateValue.getMinutes()),
				parseIntOrDefault(second, newDateValue.getSeconds()),
				parseIntOrDefault(millisecond, newDateValue.getMilliseconds())
			);

			return newDateValue;
		}

		return null;
	}

	extractTime(time) {
		// remove extra spaces from string
		time = TimeParser._removeSpaces(time);

		// setup return object with that will contain values of time
		const timeValues = {
			isInvalid: false,
			invalidValues: []
		};

		// first check if time is in correct format
		if (this.checkFormat(time) === false) {
			timeValues.isInvalid = true;
			timeValues.invalidValues.push('format');

			return timeValues;
		}

		// go through the all format parts
		for (const curFormatPart of this._formatParts) {
			// check if current format part contains rule
			const curRegexRule = regexRules[curFormatPart];
			if (curRegexRule) {
				// prepair regex
				const rule = new RegExp(curRegexRule, 'g');
				// extract value using regex
				const value = rule.exec(time)[0];
				// find validator for current format part to validate value
				const validator = this.getValidator(curFormatPart);
				if (
					validator &&
					// validate value
					validator.validate(value, curFormatPart) === false
				) {
					timeValues.isInvalid = true;
					timeValues.invalidValues.push(
						this._getFormatPropertyName(curFormatPart)
					);
				}

				const prop = this._getFormatPropertyName(curFormatPart);

				timeValues[prop] = value;
				// go to the next value
				time = time.substring(value.length);
			} else {
				// there is no rule for current format part so it is unknown token
				// so just skip it
				time = time.substring(curFormatPart.length);
			}
		}

		return timeValues;
	}

	_getFormatPropertyName(formatPart) {
		switch (formatPart) {
			case 'hh':
			case 'h':
			case 'HH':
			case 'H':
				return 'hour';
			case 'MM':
			case 'M':
				return 'minute';
			case 'ss':
			case 's':
				return 'second';
			case 'l':
			case 'L':
				return 'millisecond';
			case 'TT':
			case 'T':
			case 'tt':
			case 't':
				return 'meridiem';
		}

		throw new Error(`Unsupported format part ${formatPart}`);
	}

	static validateFormat(formatParts) {
		// parameter is string then we need to parse it
		if (typeof formatParts === 'string') {
			formatParts = TimeParser.parseFormat(
				TimeParser._removeSpaces(formatParts)
			);
		}

		let neighboringTokens = false;
		for (let i = 0; i < formatParts.length; i++) {
			const curToken = formatParts[i];
			// check if format contains one of unsafe types for
			// parsing
			if (
				parseUnsafeTokens.includes(curToken) &&
				i < formatParts.length - 1
			) {
				// set flag that token contains unsafe type
				neighboringTokens = true;
			} else if (neighboringTokens) {
				// is the next token is not unknown token
				// or meridiem token, token format is not valid
				if (
					regexRules[curToken] == null ||
					regexRulesMeridiem.includes(curToken)
				) {
					// otherwise the following token is correct one and we can
					// safely parse time format
					neighboringTokens = false;
				} else {
					return false;
				}
			}
		}

		// if there isn't any neighboring token without separator
		// then time format is valid
		return neighboringTokens === false;
	}

	static createTimeFormatRegex(formatParts) {
		const regexParts = [];
		for (const curToken of formatParts) {
			const rule = regexRules[curToken];
			if (rule) {
				regexParts.push(rule);
			} else {
				regexParts.push(curToken.replace(/\./g, '\\.'));
			}
		}

		return new RegExp(`^${regexParts.join('')}$`, 'g');
	}

	static parseFormat(format) {
		const tokens = Object.keys(regexRules).sort(
			(a, b) => b.length - a.length
		);
		const foundParts = [];
		let unknownToken = '';

		const unknownTokenFunc = () => {
			if (unknownToken.length > 0) {
				foundParts.push(unknownToken);
				unknownToken = '';
			}
		};

		while (format.length > 0) {
			const foundToken = tokens.find(curToken => {
				const formatPart = format.slice(0, curToken.length);
				return curToken === formatPart;
			});

			if (foundToken != null) {
				unknownTokenFunc();

				foundParts.push(foundToken);
				format = format.substring(foundToken.length);
			} else {
				unknownToken += format.slice(0, 1);
				format = format.substring(1);
			}
		}

		unknownTokenFunc();

		return foundParts;
	}

	static _removeSpaces(str) {
		return str.replace(/\s+/g, ' ').trim();
	}
}
