import React from 'react';
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

  async createSession() {
    try {
      const response = await fetch(sessionUrl(this.props.stage), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'hmac ' + this.props.signature,
        },
        body: this.props.dataString,
      });
      const json = await response.json();
      if (json.status === 200) {
        this.setState({ token: json.data.token, link: json.data.link });
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

  componentDidMount() {
    this.createSession();
  }

  // eslint-disable-next-line prettier/prettier
  componentWillUnmount() { }

  debugging = `
     // Debug
     console = new Object();
     console.log = function(log) {
       //window.webViewBridge.send("console", log);
       (window["ReactNativeWebView"]  || window).postMessage(log);
     };
     console.debug = console.log;
     console.info = console.log;
     console.warn = console.log;
     console.error = console.log;
     `;

  render() {
    return this.state.loading ? (
      <ActivityIndicator size="large" />
    ) : (
      <SafeAreaView>
        <WebView
          injectedJavaScript={this.debugging}
          style={styles.container}
          source={{ uri: this.state.link! }}
          onLoadStart={(a) => {
            if (a.nativeEvent.url === this.state.link) {
              this.setState({ webloading: true });
            }
          }}
          onLoadEnd={(a) => {
            console.log(a.nativeEvent.url);
            if (a.nativeEvent.url === this.state.link) {
              this.setState({ webloading: false });
            }
          }}
          onMessage={(event) => {
            console.log('CONSOLE', event);
            if (event.nativeEvent.url === this.state.link) {
              if (event.nativeEvent.data) {
                // let data = JSON.parse(event.nativeEvent.data);
                // if (data.event_id === this.state.token) {
                //   this.props.callback(data.response);
                // }
              }
            }
          }}
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
