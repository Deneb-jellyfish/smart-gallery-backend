const fs = require('fs');
const path = require('path');

exports.handler = async function () {
  const filePath = path.join(__dirname, '..', 'unlocks.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: data
  };
};
