import https from 'https';
https.get('https://upload.wikimedia.org/wikipedia/commons/b/b5/Kevin_MacLeod_-_A_Mission_-_Scoring_Action.ogg', (res) => {
  console.log('Headers:', res.headers);
});
