import React from 'react';
import {
  View,
  Slider,
  Text,
  StyleSheet,
  AsyncStorage
} from 'react-native';
import init from 'react_native_mqtt';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync : {
  }
});

const TOPIC = 'bristleback';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  constructor (props) {
    super(props);

    const client = new Paho.MQTT.Client('mqtt.monz.pro', 8083, 'controller');
    client.onConnectionLost = this.onConnectionLost;
    client.onMessageArrived = this.onMessageArrived;
    client.connect({ onSuccess: this.onConnect, userName: 'tony', password: '123456' });

    this.state = {
      vertical: 0,
      horizontal: 0,
      client,
      connected: false
    };
  }

  setVertical = val => {
    this.setState({
      vertical: val
    });
    this.send(val, '/vertical');
  };

  setHorizontal = val => {
    this.setState({
      horizontal: val
    });
    this.send(val, '/horizontal');
  };

  onConnect = () => {
    console.log('Connected');
    const { client } = this.state;
    client.subscribe(TOPIC + '/+');
    this.setState({
      connected: true
    });
  };

  onConnectionLost = responseObject => {
    if (responseObject.errorCode !== 0) {
      console.log(`connection lost: ${responseObject.errorMessage}`);
      this.setState({
        connected: false
      });
    }
  };

  onMessageArrived = message => {
    console.log(`${message.destinationName}: ${message.payloadString}`);
  };

  send = (message, subtopic) => {
    const { client, connected } = this.state;
    if (!connected) {
      return;
    }
    client.send(TOPIC + subtopic, message.toString());
  };

  render () {
    const { connected } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.statusText}>
            { connected ? 'Connected' : 'Disconnected' }
          </Text>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}>
            <Slider
              disabled={!connected}
              minimumValue={-100}
              maximumValue={100}
              step={1}
              value={this.state.vertical}
              onValueChange={val => this.setVertical(val)}
              onSlidingComplete={() => this.setVertical(0)}
              minimumTrackTintColor={'grey'}
              maximumTrackTintColor={'grey'}
              style={{transform: [{ rotate: '270deg'}]}}
            />
          </View>
          <View style={styles.cell}>
            <Slider
              disabled={!connected}
              minimumValue={-100}
              maximumValue={100}
              step={1}
              value={this.state.horizontal}
              onValueChange={val => this.setHorizontal(val)}
              onSlidingComplete={() => this.setHorizontal(0)}
              minimumTrackTintColor={'grey'}
              maximumTrackTintColor={'grey'}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
    padding: 50
  },
  header: {
    height: 30,
    padding: 5
  },
  statusText: {
    textAlign: 'center',
    fontWeight: 'bold'
  }
});
