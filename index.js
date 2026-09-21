/**
 * @format
 */

// Must be the first import in the entry file: gesture-handler patches native
// gesture APIs, and anything that touches them before this runs gets the
// unpatched versions.
import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';
import App from '@app/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
