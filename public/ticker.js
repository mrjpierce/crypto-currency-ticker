var socket = io.connect('http://localhost');
socket.on('tick', function (data) {
    console.log(data);
    // socket.emit('my other event', { my: 'data' });
});