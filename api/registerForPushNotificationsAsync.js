import { Permissions, Notifications } from 'expo';
import axios from 'axios';

// Example server, implemented in Rails: https://git.io/vKHKv
// const PUSH_ENDPOINT = 'https://expo-push-server.herokuapp.com/tokens';
const PUSH_ENDPOINT = 'http://5acf2105.ngrok.io';

export default (async function registerForPushNotificationsAsync() {
  // Android remote notification permissions are granted during the app
  // install, so this will only ask on iOS
  let { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

  // Stop here if the user did not grant permissions
  if (status !== 'granted') {
    return;
  }

  // Get the token that uniquely identifies this device
  let token = await Notifications.getExpoPushTokenAsync();

  // POST the token to our backend so we can use it to send pushes from there
  return axios.post(PUSH_ENDPOINT, {
    token: {
      value: token
    }
  });
});
