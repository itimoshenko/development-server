const source = new EventSource('http://localhost:9006/development-server');

source.addEventListener('open', function() {
  console.log('Connections to the development server established');
}, false);

source.addEventListener('message', function(e) {
  if (e.data.includes('action:reload')) {
    document.location.reload();
  }
});
