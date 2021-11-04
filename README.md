# react-native-directpay-sdk

DirectSDK for IPS

## Installation

```sh
npm install react-native-directpay-sdk
```

## Usage

```js
import { IPGComponent, IPGStage } from 'react-native-directpay-sdk';

// ...

<IPGComponent
    stage={IPGStage.DEV}
    signature={params.signature}
    dataString={params.payload}
    callback={(data: any) => {
        console.log(JSON.stringify(data));
    }}
/>
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
