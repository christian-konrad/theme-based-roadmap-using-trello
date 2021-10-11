const _getDataFromTrello = (callback) => {
  fetch('/v1/trello/roadmap-board')
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.statusText);
      }
    })
    .then(data => {
      callback(data)
    })
    .catch(error => {
      _renderError(error);
    });
};

const _renderError = (error) => {
  $('#roadmap-wrapper').html(`
    <div class="error-container">
      <div class="error-text"></div>
    </div>
  `);
  $('#roadmap-wrapper').find('.error-text').text(error);
}

/* local fallback data for testing */
const _localData = {
  "lanes": [
    { "id": "test", "title": "Test", "color": "#5fa545" },
  ],
  "releases": [
    {
      "id": "now",
      "title": "NOW",
      "lanes": [
        {
          "id": "connect",
          "themes": [
            {
              "title": "Test title",
              "subtitle": "Test description",
              "features": [
                {
                  "title": "Test feature title",
                  "subtitle": "Test description"
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "vision": "",
  "pillars": []
}

const getData = ({ source='local' }={}, callback) => {
  if (source === 'trello') {
    _getDataFromTrello(callback);
    return;
  }
  callback(_localData);
};
