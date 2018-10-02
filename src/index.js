import React from 'react';
import ReactDOM from 'react-dom';

import TimePickerInput from './js/time_picker/TimePickerInput';

const rootElement = document.getElementById('root');
ReactDOM.render(
	<TimePickerInput
		id="test-timepicker"
		use12Hours={true}
		disabled={false}
		stepMinute={5}
		onValueChange={(curDateTime, id) => {
			// eslint-disable-next-line no-console
			console.log(id, curDateTime, curDateTime.getMilliseconds());
		}}
	/>,

	rootElement
);
