import React from 'react';
import ReactDOM from 'react-dom';

import TimePicker from './time_picker/TimePicker';

const rootElement = document.getElementById('root');
ReactDOM.render(<TimePicker use12Hours={true} stepMinute={20} />, rootElement);
