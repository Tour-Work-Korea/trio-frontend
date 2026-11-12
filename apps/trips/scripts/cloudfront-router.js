// Attached only to /trips, /trips/* and /trips-assets/* cache behaviors.
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri === '/trips' || uri === '/trips/') request.uri = '/trips/index.html';
  else if (uri === '/trips/programs' || uri === '/trips/programs/') request.uri = '/trips/programs/index.html';
  else if (uri === '/trips/reground-jeju' || uri === '/trips/reground-jeju/') request.uri = '/trips/reground-jeju/index.html';
  else if (uri.indexOf('/trips/') === 0 && uri.indexOf('.') === -1) request.uri = '/trips/index.html';
  return request;
}
