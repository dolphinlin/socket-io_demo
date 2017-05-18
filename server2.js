const Koa = require('koa'),
      app = new Koa(),
      router = require('koa-router')(),
      server = require('http').createServer(app.callback()),
      fs = require('fs')

let io = require('socket.io')(server)

function readFileAsync(path, encoding = 'utf8') {
  return new Promise((resolve, reject) => {
    fs.readFile(path, encoding, (err, data) => {
      if (err) reject(err)

      resolve(data)
    })
  })
}

router
  .get('/', async (ctx, next) => {
    ctx.body = 'Hello Home'
    await next()
  })
  .get('/socket', async (ctx, next) => {
    ctx.body = await readFileAsync(__dirname + '/src/index2.html')

    await next() //36
  })

let userMap = new Map()

io.on('connection', (socket) => {
  socket.on('set socket id', (data) => {
    socket.userId = data
    userMap.set(data, socket.id)
  })
  console.log(`have a socket connected => ${socket.id}`)
  socket.on('post msg', (msg) => {
    console.log(socket.rooms)
    console.log(`${socket.id} post => ${msg}`)
    io.emit('global msg', {
      data: `${msg} by ${socket.id}`
    })
  })
  socket.on('private msg', (data) => {
    console.log(data, userMap.get(data.id))
    io.to(userMap.get(data.id)).emit('private msg', data.msg)
  })
})

app
  .use(router.routes())
  .use(async (ctx, next) => {
    // console.log(ctx.body)
    await next()
  })

server.listen(3000)
