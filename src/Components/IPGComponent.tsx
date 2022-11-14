import React from 'react';
import { Pusher } from '@pusher/pusher-websocket-react-native'
import {
  // ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  // Text,
} from 'react-native';
import { IPGStage } from 'react-native-directpay-ipg';
import {WebView} from 'react-native-webview';
import AwesomeLoading from 'react-native-awesome-loading';

const pusher = Pusher.getInstance();

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
          'x-plugin-source': 'REACT-NATIVE',
          'x-plugin-version': '0.1.4',
          'Authorization': 'hmac ' + this.props.signature,
        },
        body: this.props.dataString,
      });
      const json = await response.json();
      console.log(json);
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
    // this.pusher = new Pusher(ak, {
    //   cluster: 'ap2',
    // });

    await pusher?.init({ 
      apiKey: ak,
      cluster: ch,
      onConnectionStateChange: (currentState: string) => {
        console.log(`Connection: ${currentState}`);
      },
      onSubscriptionError: (channelName: string, message:string, e:any) => {
        console.log(`onSubscriptionError: ${message} channelName: ${channelName} Exception: ${e}`);
      } 
    });

      await pusher?.subscribe({ channelName: ch });
      await pusher?.connect();

   // this.bindToPusher(ch);
  }

  // bindToPusher(ch: string) {
  //   setTimeout(() => {
  //     let connection = this.pusher!.connect.bind(
  //       'error',
  //       function (err: any) {
  //         if (err.error.data.code === 4004) {
  //           console.log('Over limit!');
  //         }
  //       }
  //     );
  //     // if (connection.state === 'connected') {
  //     //   const channel = this.pusher!.subscribe(ch);
  //     //   channel.bind('SDK_' + this.state.token, (data: any) => {
  //     //     this.props.callback(data.response);
  //     //   });
  //     // } else if (connection.state === 'connecting') {
  //     //   this.bindToPusher(ch);
  //     // }
  //   }, 1000);
  // }

  componentDidMount() {
    this.createSession();
  }

  componentWillUnmount() {
    if (pusher) {
      pusher.unsubscribe({channelName: 'dp_plugin_dev'});
      pusher.disconnect();
    }
  }

  IndicatorLoadingView() {
    return (
      <AwesomeLoading
        indicatorId={8}
        size={50}
        isActive={true}
        text="Please wait..."
      />
    );
  }

  render() {
    return this.state.loading ? (
      this.IndicatorLoadingView()
    ) : (
      <SafeAreaView>
        <WebView
          startInLoadingState={true}
          javaScriptEnabled={true}
          renderLoading={this.IndicatorLoadingView}
          style={styles.container}
          source={{ uri: this.state.link! }}
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
  indicator: {
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IPGComponent;
