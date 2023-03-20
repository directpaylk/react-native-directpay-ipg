# react-native-directpay-ipg

React native SDK for [DirectPay IPG](https://directpay.lk/ipg, "DirectPay IPG")

## Installation

```sh
npm install react-native-directpay-ipg-plugin
```

## Usage

```js
import { IPGComponent, IPGStage } from 'react-native-directpay-ipg-plugin';

// ...

<IPGComponent
    stage={IPGStage.DEV}
    signature={signature}
    dataString={payload}
    callback={(data: any) => {
        console.log(JSON.stringify(data));
    }}
/>
```

### How to make a payment?

1. first select stage - ```IPGStage.DEV / IPGStage.PROD```
2. Create payment **payload** & **signature** from Server-side and parse signature and base64 encoded payload to *IPGComponent*

    *Note: it's the best practice to create payload and signature from server side. otherwise the data will be compromised.*

#### payload
Payload is a base64 encoded string that created from JSON payload string. Here is a sample object,
```js
payload = {
   merchant_id : "xxxxxx",
   amount : "10.00",
   type : "ONE_TIME",
   order_id : "CP123456789",
   currency : "LKR",
   response_url : "https://test.com/response-endpoint",
   first_name : "Sam",
   last_name : "Perera",
   email : "user@email.com",
   phone : "0712345678",
   logo : "",
};
```
#### signature
Signature is HmacSHA256 hash of the base64 encoded payload string. The **secret** for HmacSHA256 can be found at developer portal.

```js
createHmacSha256Hash(base64jsonPayload, secret);
```

Provide these two arguments to IPGComponent and you'll receive the reponse from *callback* function.

---

Read more at [Documentation](https://doc.directpay.lk/, "DirectPay Documentation")

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
