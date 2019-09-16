/*
Copyright © 2015 Infrared5, Inc. All rights reserved.

The accompanying code comprising examples for use solely in conjunction with Red5 Pro (the "Example Code") 
is  licensed  to  you  by  Infrared5  Inc.  in  consideration  of  your  agreement  to  the  following  
license terms  and  conditions.  Access,  use,  modification,  or  redistribution  of  the  accompanying  
code  constitutes your acceptance of the following license terms and conditions.

Permission is hereby granted, free of charge, to you to use the Example Code and associated documentation 
files (collectively, the "Software") without restriction, including without limitation the rights to use, 
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit 
persons to whom the Software is furnished to do so, subject to the following conditions:

The Software shall be used solely in conjunction with Red5 Pro. Red5 Pro is licensed under a separate end 
user  license  agreement  (the  "EULA"),  which  must  be  executed  with  Infrared5,  Inc.   
An  example  of  the EULA can be found on our website at: https://account.red5pro.com/assets/LICENSE.txt.

The above copyright notice and this license shall be included in all copies or portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,  INCLUDING  BUT  
NOT  LIMITED  TO  THE  WARRANTIES  OF  MERCHANTABILITY, FITNESS  FOR  A  PARTICULAR  PURPOSE  AND  
NONINFRINGEMENT.   IN  NO  EVENT  SHALL INFRARED5, INC. BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN  AN  ACTION  OF  CONTRACT,  TORT  OR  OTHERWISE,  ARISING  FROM,  OUT  OF  OR  IN CONNECTION 
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
((window, Promise, jwplayer, red5pro) => {

  if (!jwplayer) {
    console.error('JWPlayer required.')
    return
  }

  red5pro.setLogLevel('debug')

  const RED5PRO = 'red5pro'
  const typeMatch = /^red5pro/

  const log = (message) => {
    console.log(`[red5pro] :: ${message}`)
  }

  const generateVideoElement = (elementId, muted) => {
    var video = document.createElement('video')
    video.id = elementId
    video.muted = muted
    return video
  }

  function R5ProPlayerProvider (playerId, config, mediaElement) { // eslint-disable-line no-unused-vars
    this.container = undefined
    this.subscriber = undefined
    this.volumeValue = 1
    this.muted = !!config.mute
    this.initPlaybackSettings = {
      autostart: !!config.autostart,
      muted: config.mute
    }
    this.initConfiguration = Object.assign(config.setupConfig.red5pro, {
      streamName: config.setupConfig.file.match(/(.*)\.red5pro/)[1]
    })
    console.log(config)
    console.log(this.initConfiguration)

    Object.assign(this, jwplayer(playerId).Events, {
      onSubscribeEvent: (event) => {
        if (event.type === 'Subscribe.Time.Update') {
          this.trigger('time', {
            position: event.data.time,
            duration: event.data.time
          })
          return
        } else if (event.type === 'Subscribe.InvalidName') {
            this.trigger('red5pro:error', {
              code: 102640,
              sourceError: event.type,
              message: 'Could not establish Subscriber.'
            })
            this.setState('error')
        } else if (event.type === 'Subscribe.Play.Unpublish') {
          this.trigger('complete')
        } else if (event.type === 'Subscribe.Connection.Closed') {
          this.trigger('playlistComplete')
        }
        this.trigger('red5pro:event', Object.assign(event, {eventType:event.type}))
      },

      play: () => {
        log('play()')
        if (this.subscriber) {
          this.subscriber.resume()
          this.setState('playing')
          this.setVisibility(true)
        }
        return Promise.resolve()
      },

      pause: () => {
        log('pause()')
        if (this.subscriber) {
          this.setState('paused');
          this.subscriber.pause()
        }
      },

      stop: () => {
        log('stop()')
        if (this.subscriber) {
          this.setState('idle');
          this.subscriber.stop()
        }
      },

      preload: () => {
        log('preload()')
      },

      load: () => {
        log('load()')
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
            this.trigger('red5pro:error', {
              code: 102640,
              sourceError: error,
              message: 'Could not establish Subscriber.'
            })
            this.setState('error')
          })
      },

      volume: (value) => {
        log(`setVolume(${value})`)
        this.volumeValue = value/100
        if (this.subscriber && !this.muted) {
          this.subscriber.setVolume(this.volumeValue)
        }
      },

      mute: (muted) => {
        log(`mute(${muted})`)
        this.muted = muted
        if (this.subscriber) {
          muted ? this.subscriber.mute() : this.subscriber.unmute()
          muted ? this.subscriber.setVolume(0) : this.subscriber.setVolume(this.volumeValue)
        }
      },

      setContainer: (container) => {
        log('setContainer()')
        const videoElement = generateVideoElement(this.initConfiguration.mediaElementId, this.initPlaybackSettings.muted)
        this.container = container
        this.container.appendChild(videoElement)
      }
    })

  }

  R5ProPlayerProvider.supports = item => {
    return typeMatch.test(item.type)
  }

  R5ProPlayerProvider.getName = () => {
    return {
      name: RED5PRO
    }
  }

  jwplayer.api.registerProvider(R5ProPlayerProvider)

})(window, window.Promise, window.jwplayer, window.red5prosdk)
