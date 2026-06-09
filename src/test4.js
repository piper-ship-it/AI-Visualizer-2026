import https from 'https';
https.get('https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/viper.mp3', (res) => {
  console.log('Headers:', res.headers);
});
