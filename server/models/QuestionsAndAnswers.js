const { Pool } = require('pg');

const pool = new Pool({
  "database": 'questionsandanswers',
  "max" : 20,
  "connectionTimeoutMillis": 0,
  "idleTimeoutMillis": 0
})

const getQuestionsQuery = (product_id, limit) => {

  var stringifiedID = "'"+product_id+"'";

  return (
    `SELECT json_build_object (
      'product_id',${stringifiedID},
      'results', (
         SELECT json_agg (
          json_build_object (
            'question id', id,
            'question_body', body,
            'question_date', date_written,
            'asker_name', asker_name,
            'question_helpfulness', helpful,
            'reported', reported,
            'answers',(
              SELECT json_object_agg(
                id,(
                  SELECT json_build_object(
                    'id',id,
                    'body', body,
                    'date', date_written,
                    'answerer_name',answerer_name,
                    'helpfulness',helpful,
                    'photos',(SELECT json_agg(url) FROM photo WHERE photo.answer_id = answer.id)
                  )
                )
              ) FROM ANSWER WHERE answer.question_id = question.id
            )
          )
         ) FROM question where product_id = ${Number(product_id)} limit ${Number(limit)}
      )
    ) as questions`
  )
}

const getAnswersQuery = (question_id, limit) => {
  var stringifiedID = "'"+question_id+"'";
  return (
    SELECT json_build_object (
      'question' , ${stringifiedID},
      'results', (
        SELECT json_agg (
          json_build_object (
            'answer_id', id,
            'body', body,
            'date', date_written,
            'answerer_name', answerer_name,
            'helpfulness', helpful,
            'photos', (
              SELECT json_agg (
                json_build_object (
                  'id', id,
                  'url', url
                )
              ) FROM photo WHERE photo.answer_id = answer.id
            )
          )
        ) FROM ANSWER WHERE question_id = ${question_id}
      )

    )
  )
}
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// pool.connect().then((client) => {
//   return client
//     .query(testQuery)
//     .then((res) => {
//       console.log(res.rows[0].questions.results)
//     })
//     .catch((err) => {
//       client.release()
//       console.log(err.stack)
//     })
// })

