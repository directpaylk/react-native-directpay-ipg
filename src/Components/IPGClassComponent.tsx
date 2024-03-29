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
import { WebView } from 'react-native-webview';
import AwesomeLoading from 'react-native-awesome-loading';

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

  pusher = Pusher.getInstance();
  _isMounted = false;


  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = { link: '', token: null, loading: true, webloading: false };
  }

  async killSession() {
    //this.pusher.unsubscribe({ channelName: 'dp_plugin_dev' });
    if(this._isMounted) {
      await this.pusher.disconnect()
      await this.pusher.unsubscribe({ channelName: 'dp_plugin_dev' });
      // await this.pusher.disconnect()
    }
    
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
      this.setState({ loading: false });
    } finally {
      console.log("finally");
      this.setState({ loading: false });
    }
  }

  async initPusher(ak: string, ch: string) {

    await this.pusher?.init({
      apiKey: ak,
      cluster: ch,
      onConnectionStateChange: async (currentState: string) => {
        //console.log(`Connection: ${currentState}`);
        if (currentState == "CONNECTED") {
          let data: any;
          await this.pusher?.subscribe({
            channelName: ch, onSubscriptionSucceeded(data) {
              data = data.response
            },
          });
          this.props.callback(data)
          // channel.onSubscriptionSucceeded = (data) => {
          //   this.props.callback(data.response)
          // }
        }
      },
      onSubscriptionError: (channelName: string, message: string, e: any) => {
        //console.log(`onSubscriptionError: ${message} channelName: ${channelName} Exception: ${e}`);
        console.log(`onSubscriptionError: ${message} channelName: ${channelName} Exception: ${e}`);
        this.props.callback({
          status: 400,
          data: {
            code: 'SERVER_ERROR',
            title: 'Failed proceed payment',
            message: message,
          },
        });
      },
    });

    await this.pusher?.connect();

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
    this._isMounted = true;
    this.createSession();
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.pusher) {
      this.killSession()
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
      // <Text>Loading....</Text>
    );
  }

  render() {
    return this.state.loading ? (
      this.IndicatorLoadingView()
    ) :
      (
        <SafeAreaView>
          <WebView
            startInLoadingState={true}
            javaScriptEnabled={true}
            //renderLoading={this.IndicatorLoadingView}
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
