import React from 'react';
import Pusher from 'pusher-js/react-native';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { IPGStage } from 'react-native-directpay-ipg';
import WebView from 'react-native-webview';

interface Props {
  stage: string;
  signature: string;
  dataString: string;
  callback: Function;
}

interface States {
  token: string | null;
  link: string;
  loading: boolean;
  webloading: boolean;
}

const sessionUrl = (stage: string) => {
  return stage === IPGStage.PROD
    ? 'https://gateway.directpay.lk/api/v3/create-session'
    : 'https://test-gateway.directpay.lk/api/v3/create-session';
};
class IPGComponent extends React.Component<Props, States> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = { link: '', token: null, loading: true, webloading: false };
  }

  pusher: Pusher | undefined;

  async createSession() {
    try {
      const response = await fetch(sessionUrl(this.props.stage), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-plugin-source': 'REACT-NATIVE',
          'x-plugin-version': '0.1.3',
          'Authorization': 'hmac ' + this.props.signature,
        },
        body: this.props.dataString,
      });
      const json = await response.json();
      if (json.status === 200) {
        this.setState({ token: json.data.token, link: json.data.link });
        this.initPusher(json.data.ak, json.data.ch);
      } else {
        this.props.callback(json);
      }
    } catch (error) {
      this.props.callback({
        status: 400,
        data: {
          code: 'SERVER_ERROR',
          title: 'Failed proceed payment',
          message: 'Failed proceed payment',
        },
      });
    } finally {
      this.setState({ loading: false });
    }
  }

  async initPusher(ak: string, ch: string) {
    console.log(ak, ch);
    this.pusher = new Pusher(ak, {
      cluster: 'ap2',
    });

    setTimeout(() => {
      let connection = this.pusher!.connection.bind(
        'error',
        function (err: any) {
          if (err.error.data.code === 4004) {
            console.log('Over limit!');
          }
        }
      );
      console.log(connection.state);
      if (connection.state === 'connected') {
        console.log('listening...');
        const channel = this.pusher!.subscribe(ch);
        channel.bind('SDK_' + this.state.token, (data: any) => {
          this.props.callback(data.response);
        });
      }
    }, 1000);
  }

  componentDidMount() {
    this.createSession();
  }

  componentWillUnmount() {
    if (this.pusher) {
      this.pusher.unsubscribe('dp_plugin_dev');
      this.pusher.disconnect();
    }
  }

  IndicatorLoadingView() {
    return <ActivityIndicator size="large" />;
  }

  render() {
    return this.state.loading ? (
      <ActivityIndicator size="large" />
    ) : (
      <SafeAreaView>
        <WebView
          style={styles.container}
          source={{ uri: this.state.link! }}
          startInLoadingState={true}
          renderLoading={this.IndicatorLoadingView}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    marginVertical: 20,
  },
});

export default IPGComponent;
