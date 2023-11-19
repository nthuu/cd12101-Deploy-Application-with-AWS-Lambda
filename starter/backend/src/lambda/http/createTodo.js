import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createTodo } from '../../businessLogic/todos.mjs'
import { getUserId } from '../utils.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    const newTodo = JSON.parse(event.body)
    const userId = getUserId(event)
    const newItem = await createTodo(newTodo, userId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
      })
    }
  })
