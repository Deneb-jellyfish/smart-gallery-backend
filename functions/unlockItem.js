const fs = require('fs');
const path = require('path');

exports.handler = async function (event) {
  const filePath = path.join(__dirname, '..', 'unlocks.json');

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  const body = JSON.parse(event.body || '{}');
  const id = body.id;

  if (!id) {
    return {
      statusCode: 400,
      body: 'Missing id'
    };
  }

  const current = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  current[id] = true;
  fs.writeFileSync(filePath, JSON.stringify(current, null, 2));

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ success: true })
  };
};
