import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createLogger } from '../utils/logger.mjs'
import { getAttachmentUrl } from '../fileStorage/attachmentUtils.mjs'

const logger = createLogger('TodoAccess')

export class TodosAccess {
  constructor(
    documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
    todosTable = process.env.TODOS_TABLE,
    todosIndex = process.env.TODOS_CREATED_AT_INDEX,
    bucketName = process.env.ATTACHMENTS_S3_BUCKET,
    s3Client = new S3Client(),
    urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {
    this.documentClient = documentClient
    this.todosTable = todosTable
    this.todosIndex = todosIndex
    this.bucketName = bucketName
    this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
    this.s3Client = s3Client
    this.urlExpiration = urlExpiration
  }

  async getTodos(userId) {
    logger.info(`Get todo items of user ${userId}`)

    const result = await this.dynamoDbClient.query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })

    return result.Items
  }

  async createTodo(todo) {
    logger.info(`Create todo item ${todo.todoId}`)

    await this.dynamoDbClient.put({
      TableName: this.todosTable,
      Item: todo
    })

    return todo
  }

  async updateTodo(userId, todoId, updatedTodo) {
    logger.info(`Update todo item ${todoId}`)

    await this.dynamoDbClient.update({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ExpressionAttributeValues: {
        ':name': updatedTodo.name,
        ':dueDate': updatedTodo.dueDate,
        ':done': updatedTodo.done
      }
    })
  }

  async deleteTodo(userId, todoId) {
    logger.info(`Delete todo item ${todoId}`)

    await this.dynamoDbClient.delete({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    })
  }

  async generateUploadUrl(userId, todoId) {
    logger.info(`Generate upload URL todo item ${todoId}`)

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: todoId
    })

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: parseInt(this.urlExpiration)
    })

    logger.info(`Upload URL ${url}`)

    await this.dynamoDbClient.update({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': getAttachmentUrl(todoId)
      }
    })

    return url
  }
}
