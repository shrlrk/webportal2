const https = require('https');

https.get('https://dy365.vercel.app/', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const match = data.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (match) {
      console.log('Found JS:', match[1]);
      https.get('https://dy365.vercel.app' + match[1], (jsRes) => {
        let jsData = '';
        jsRes.on('data', d => jsData += d);
        jsRes.on('end', () => {
          console.log('Includes [STEP 0]?', jsData.includes('[STEP 0]'));
          console.log('Includes JS 필터링으로 조회 성공?', jsData.includes('JS 필터링으로 조회 성공'));
          console.log('Includes 3b82f6 (Logout Blue)?', jsData.includes('3b82f6'));
        });
      });
    } else {
      console.log('No JS bundle found');
    }
  });
});
