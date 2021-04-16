import http from 'http'

const port = 8808;
const server = http.createServer()
server.on('request', (req, res) => {
  res.statusCode = 200

  res.end(JSON.stringify({ url: req.url, ip: req.ip }))
})

server.on('listening', () => {
  console.log(`start ${ port }`)
})

server.listen(port)
