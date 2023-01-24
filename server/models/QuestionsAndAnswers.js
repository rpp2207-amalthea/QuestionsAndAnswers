const { Pool } = require('pg');

const pool = new Pool({
  "database": 'questionsandanswers',
  "max" : 20,
  "connectionTimeoutMillis": 0,
  "idleTimeoutMillis": 0
})

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

pool.connect().then((client) => {
  return client
    .query('SELECT * FROM answer JOIN photo ON answer_id = $1', [1])
    .then((res) => {
      client.release()
      console.log(res.rows)
    })
    .catch((err) => {
      client.release()
      console.log(err.stack)
    })
})