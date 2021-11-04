import * as React from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IPGComponent, IPGStage } from 'react-native-directpay-sdk';
import base64 from 'react-native-base64';
import { JSHmac, CONSTANTS } from 'react-native-hash';

const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 600,
    height: 600,
    marginVertical: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 2,
    borderColor: '#0829cc',
    borderRadius: 12,
    padding: 10,
  },
  view: {
    flex: 1,
  },
  divider: {
    height: 2,
    backgroundColor: '#707070',
    marginRight: 10,
    marginLeft: 10,
  },
  helpbox: {
    margin: 10,
    backgroundColor: '#0829cc',
    padding: 10,
    borderRadius: 10,
  },
  helpboxtext: {
    color: '#FFFFFF',
  },
});

function CheckoutComponent(nav: any) {
  let params = nav.route.params;
  return (
    <View style={styles.container}>
      <IPGComponent
        stage={IPGStage.DEV}
        signature={params.signature}
        dataString={params.payload}
        callback={(data: any) => {
          nav.navigation.navigate({
            name: 'Payment',
            params: { data },
            merge: true,
          });
        }}
      />
    </View>
  );
}

function PaymentScreen(nav: any) {
  const [mid, onChangeMid] = React.useState('DP00001');
  const [secret, onChangeSecret] = React.useState('u4V376WvJJij');
  const [amount, onChangeAmount] = React.useState('169.00');
  const [type, onChangeType] = React.useState('ONE_TIME');
  const [orderId, onChangeOId] = React.useState('INV00369');
  const [currency, onChangeCurrency] = React.useState('LKR');
  const [responseUrl, onChangeUrl] = React.useState(
    'http://localhost/payment_test_directpay/controllers/serverRes.php'
  );
  const [fname, onChangeFname] = React.useState('John');
  const [lname, onChangeLname] = React.useState('Appleseed');
  const [phone, onChangePhone] = React.useState('0771105130');
  const [email, onChangeEmail] = React.useState('deeptha@paymedia.lk');
  const [logo, onChangeLogo] = React.useState(
    'https://is2-ssl.mzstatic.com/image/thumb/Purple124/v4/28/fa/57/28fa57e1-7685-2f11-de16-6dba1d30ea32/AppIcon-1x_U007emarketing-0-10-0-0-85-220.png/1200x630wa.png'
  );

  React.useEffect(() => {
    if (nav.route.params?.data) {
      let response = nav.route.params.data;
      if (response.status === 200 && response.data === undefined) {
        Alert.alert('Response', JSON.stringify(response));
      } else {
        Alert.alert(response.data.title, response.data.message);
      }
    }
  }, [nav.route.params?.data]);

  return (
    <SafeAreaView>
      <ScrollView>
        <TextInput
          style={styles.input}
          onChangeText={onChangeMid}
          value={mid}
          placeholder={'Merchant ID'}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangeSecret}
          value={secret}
          placeholder={'Secret (Do not share with anyone)'}
        />
        <View style={styles.helpbox}>
          <Text style={styles.helpboxtext}>
            Help: Change Merchant ID, Secret and Order ID to do a test payment.
          </Text>
        </View>
        <View style={styles.divider} />
        <TextInput
          style={styles.input}
          onChangeText={onChangeAmount}
          value={amount}
          placeholder={'Amount'}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangeType}
          value={type}
          placeholder={'Type'}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangeOId}
          value={orderId}
          placeholder={'Order Id'}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangeCurrency}
          value={currency}
          placeholder={'Currency'}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangeUrl}
          value={responseUrl}
          placeholder={'Response URL'}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangeFname}
          value={fname}
          placeholder={'First Name'}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangeLname}
          value={lname}
          placeholder={'Last Name'}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangePhone}
          value={phone}
          placeholder={'Phone'}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangeEmail}
          value={email}
          placeholder={'Email'}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangeLogo}
          value={logo}
          placeholder={'Logo'}
        />

        <Button
          onPress={async () => {
            let payload = createPayload({
              merchant_id: mid,
              amount,
              type,
              order_id: orderId,
              currency,
              response_url: responseUrl,
              first_name: fname,
              last_name: lname,
              phone,
              email,
              logo,
            });

            let signature = await createSignature(payload, secret);

            nav.navigation.navigate('Checkout', {
              signature: signature,
              payload: payload,
            });
          }}
          title="Next"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function createPayload(json: any) {
  if (!json) return '';
  let stringPayload = JSON.stringify(json);
  return base64.encode(stringPayload);
}

async function createSignature(payload: string, secret: string) {
  let signature = await JSHmac(
    payload,
    secret,
    CONSTANTS.HmacAlgorithms.HmacSHA256
  );
  return signature;
}

function App() {
  const ref = React.useRef(null);

  return (
    <View style={styles.view}>
      <NavigationContainer ref={ref}>
        <Stack.Navigator initialRouteName="Payment">
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="Checkout" component={CheckoutComponent} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default App;
