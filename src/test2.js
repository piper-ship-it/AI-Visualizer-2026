import https from 'https';
https.get('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', (res) => {
  console.log('Headers:', res.headers);
});
