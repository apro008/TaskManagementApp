import { AppRegistry } from 'react-native';
import App from './src/app/App';
import { name as appName } from './app.json';
import { registerBackgroundHandler } from './src/services/notifications/messaging';

registerBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
