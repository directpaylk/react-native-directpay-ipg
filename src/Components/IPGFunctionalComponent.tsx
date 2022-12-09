import React, { useEffect, useState } from 'react'
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

const sessionUrl = (stage: string) => {
    return stage === IPGStage.PROD
        ? 'https://gateway.directpay.lk/api/v3/create-session'
        : 'https://test-gateway.directpay.lk/api/v3/create-session';
};

function IPGFunctionalComponent(props: Props) {

    const [state, setState] = useState({ link: '', token: null, loading: true, webloading: false })

    let pusher = Pusher.getInstance();

    async function createSession() {
        try {
            const response = await fetch(sessionUrl(props.stage), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-plugin-source': 'REACT-NATIVE',
                    'x-plugin-version': '0.1.4',
                    'Authorization': 'hmac ' + props.signature,
                },
                body: props.dataString,
            });

            const json = await response.json();
            console.log(json);

            if (json.status == 200) {
                setState({
                    ...state,
                    token: json.data.token,
                    link: json.data.link,
                })

                iniPusher(json.data.ak, json.data.ch)
            } else {
                props.callback(json)
            }

        } catch (e) {
            props.callback({
                status: 400,
                data: {
                    code: 'SERVER_ERROR',
                    title: 'Failed proceed payment',
                    message: 'Failed proceed payment',
                },
            })
        } finally {
            setState({ ...state, loading: false })
        }
    }

    async function iniPusher(ak: string, ch: string) {
        await pusher.init({
            apiKey: ak,
            cluster: ch,
            onConnectionStateChange: async (currentState: string) => {
              //console.log(`Connection: ${currentState}`);
              if (currentState == "CONNECTED") {
                let data: any;
                await pusher?.subscribe({
                  channelName: ch, onSubscriptionSucceeded(data) {
                    data = data.response
                  },
                });
                props.callback(data)
                // channel.onSubscriptionSucceeded = (data) => {
                //   this.props.callback(data.response)
                // }
              }
            },
            onSubscriptionError: (channelName: string, message: string, e: any) => {
              //console.log(`onSubscriptionError: ${message} channelName: ${channelName} Exception: ${e}`);
              console.log(`onSubscriptionError: ${message} channelName: ${channelName} Exception: ${e}`);
              props.callback({
                status: 400,
                data: {
                  code: 'SERVER_ERROR',
                  title: 'Failed proceed payment',
                  message: message,
                },
              });
            },
        })

        await pusher?.connect();
    }

    function IndicatorLoadingView() {
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



    useEffect(() => {
        createSession()
    }, [])

    return (
        state.loading ? <IndicatorLoadingView /> : (
            <SafeAreaView>
            <WebView
              startInLoadingState={true}
              javaScriptEnabled={true}
              //renderLoading={this.IndicatorLoadingView}
              style={styles.container}
              source={{ uri: state.link! }}
            />
          </SafeAreaView>
        )
    )
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



export default IPGFunctionalComponent
