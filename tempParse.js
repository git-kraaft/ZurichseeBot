const tempParse = function (url) {
  const fetchPromise = fetch(url);
  return fetchPromise.then(response => {
    return response.text();
  }).then(content_json => {
    // console.log(`JSON: ${content_json}`);
    const waterTemp = JSON.parse(content_json).result[0].values.water_temperature.value;
    return waterTemp;
  });
};

module.exports = tempParse;
