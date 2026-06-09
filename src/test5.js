import https from 'https';
https.get('https://api.github.com/repos/mdn/webaudio-examples/contents/audio-analyser', { headers: { 'User-Agent': 'node' } }, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(body));
});
