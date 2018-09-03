import React from 'react';
import ReactDOM from 'react-dom';

import TimePicker from './time_picker/TimePicker';

const rootElement = document.getElementById('root');
ReactDOM.render(
	<TimePicker
		id="test-timepicker"
		use12Hours={true}
		stepMinute={5}
		onValueChange={(curDateTime, id) => {
			console.log(id, curDateTime, curDateTime.getMilliseconds());
		}}
	/>,
	rootElement
);
