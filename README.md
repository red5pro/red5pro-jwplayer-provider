# red5pro-jwplayer-provider

Custom Provider for [JWPlayer](https://www.jwplayer.com/) to integrate [Red5 Pro](https://red5pro.com) Live Streaming.

# Demo

You can view the demo at [https://red5pro.github.io/red5pro-jwplayer-provider/](https://red5pro.github.io/red5pro-jwplayer-provider/)

> The source for the demo can be found in the [docs](docs) directory of this repository.

# Custom JWPlayer Provider

The example demonstrates how to create a custom [JWPlayer](https://www.jwplayer.com/) Provider in order to integrate live stream playback using the [Red5 Pro](https://red5pro.com) HTML SDK.

> The [red5pro-jwplayer-provider.js](red5pro-jwplayer-provider.js) is the custom provider source.

## Configuration

_The following is declared in [docs/index.html](docs/index.html)._

An initialization configuration required for the Red5 Pro HTML SDK when instantiating a Subscriber. For the purposes of this demo, that configuration is passed in as a custom property (named `red5pro`) through the **setup** configuration of a **jwplayer**:

```js
const player = jwplayer('video-container')
                .setup({
                  file: `${streamName}.red5pro`, // will stripe extension and use name as streamName
                  red5pro: {
                    protocol: protocol,
                    host: host,
                    port: port,
                    app: 'live',
                    mediaElementId: 'red5pro-subscriber'
                  }
              })

```

The `file` propery provides a filename with the `red5pro` extension. This will be used by the custom provider to determine if it can support playback using Red5 Pro. The `${streamName}` filename will be the target stream name you wish to subscribe to.

> To see the full list of initialization configuration properties for a Red5 Pro Subscriber, visit the documentation at [https://red5pro.com/docs/streaming/subscriber.html](https://red5pro.com/docs/streaming/subscriber.html)

## Custom Provider

_The following is declared in [red5pro-jwplayer-provider.js](red5pro-jwplayer-provider.js)._

The request to instantiate a new Red5 Pro Subscriber instance (in this example as a WebRTC-based subscriber) is offloaded to the `load` event invocation from the **jwplayer**:

```js
...
      load: () => {
      
        this.duration = NaN
        this.setState('buffering')

        new red5pro.RTCSubscriber()
          .init(this.initConfiguration)
          .then(subscriberImpl => {
            this.subscriber = subscriberImpl
            this.subscriber.on('*', this.onSubscribeEvent)
            return this.subscriber.subscribe()
          })
          .then(() => {
            this.trigger('bufferFull')
            if (this.initPlaybackSettings.autostart) {
              this.play()
            }
          })
          .catch(error => {
            console.error(error)
          })
          
      },
...
```

From there, instructions for playback and volume/mute setting are simply hooks into calls onto the `RTCSubscriber` instance that is established.

# Build

The [red5pro-jwplayer-provider.js](red5pro-jwplayer-provider.js) custom provider code is written using **ES6/ES2015**. If you know you are targeting modern browsers with such support, you can simply load it as a resource for your page.

Seeing as it is not a perfect world, this project also uses the [babel](https://babeljs.io/) compiler and [webpack](https://webpack.js.org/) bundler to distribute a "build" of the source for browsers without **ES6/2015** support.

## Commands

The following commands are available. They require [NodeJS](https://nodejs.org/en/) and `NPM` to be installed on the machine you have checked this repository out on (if you intend to modify and build yourself).

> More information: [https://docs.npmjs.com/downloading-and-installing-node-js-and-npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

### install

Befre you can run any commands, you will first need to install the `npm` packages:

```sh
npm install
```

### build

```sh
npm run build
```

This command will simply compile and bundle the `red5pro-jwplayer-provider.js` file and place it into [docs/script](docs/script) as `red5pro-jwplayer-provider.bundle.js`.

### watch

```sh
npm run watch
```

This command will run a watch on the source files and execute a `build` command on change.

### start

```sh
npm run start
```

This command will start a watch on source and launch a local server at [http://localhost:3000](http://localhost:3000) from the [docs](docs) directory.