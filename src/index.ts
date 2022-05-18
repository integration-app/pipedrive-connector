import { server } from './app'

const port = process.env.PORT ?? 3000

server.listen(port).then(() => {
  console.log(`Listening at http://localhost:${port}`)
})
