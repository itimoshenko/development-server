const source = new EventSource('http://localhost:9006/development-server');

source.addEventListener('open', function(e) {
  console.log('Connections to the development server established');
}, false);

source.addEventListener('message', function(e) {
  console.log(e.data);
});

source.addEventListener('error', function(e) {
  console.log(e);
});
