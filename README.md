# react-native-directpay-ipg

DirectSDK for IPS

## Installation

```sh
npm install react-native-directpay-ipg
```

## Usage

```js
import { IPGComponent, IPGStage } from 'react-native-directpay-ipg';

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
