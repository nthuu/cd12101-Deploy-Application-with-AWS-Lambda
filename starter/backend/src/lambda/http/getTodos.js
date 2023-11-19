import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getTodos } from '../../businessLogic/todos.mjs'
import { getUserId } from '../utils.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    const userId = getUserId(event)
    const todos = await getTodos(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({ items: todos })
    }
  })
