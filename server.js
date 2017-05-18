const Koa = require('koa'),
      app = new Koa(),
      router = require('koa-router')(),
      server = require('http').createServer(app.callback())

let io = require('socket.io')(server);

const fs = require('fs')

function readFileAsync(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err)

      resolve(data)
    })
  })
}
const MESSAGE_BODY = 'Hello, World!'

router
  .get('/', async (ctx, next) => {
    ctx.body = MESSAGE_BODY
    await next()
  })
  .get('/socket', async (ctx, next) => {
    const data = await readFileAsync(__dirname + '/src/index.html')
    ctx.body = data.toString('utf8')

    await next()
  })
  .get('/test', (ctx, next) => {

  })

io.on('connection', function(socket){
  console.log('a user connected');
  socket.join(0)
  socket.on('message', (msg) => {
    io.emit('msg', {
      data: msg
    })
  })
  socket.on('change channel', (channel) => {
    socket.leave()
    socket.join(channel)
    console.log(socket.rooms)
  })
})


app.use(router.routes())

server.listen(3000, function(){
  console.log('listening on *:3000')
})
