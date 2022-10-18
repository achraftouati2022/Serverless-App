import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
const AWSXRay = require('aws-xray-sdk') 
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.INDEX_NAME
  ) {}
  async getTodosForUser(userId: string): Promise<TodoItem[]> {
    try {
      logger.info(`Getting todos for specific user with id ${userId}`)
      const result = await this.docClient
        .query({
          TableName: this.todosTable,
          IndexName: this.todosIndex,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        })
        .promise()
      const items = result.Items
      return items as TodoItem[]
    } catch (error) {
      logger.error(error.message)
    }
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    try {
      logger.info(`Creating a new todo for user with id ${todoItem.userId}`)
      await this.docClient
        .put({
          TableName: this.todosTable,
          Item: todoItem
        })
        .promise()

      return todoItem
    } catch (error) {
      logger.error(error.message)
    }
  }

  async updateTodo(
    todoId: string,
    userId: string,
    todoUpdate: TodoUpdate
  ): Promise<void> {
    try {
      logger.info(
        `Updating a todo with id ${todoId} for user with id ${userId}`
      )
      await this.docClient
        .update({
          TableName: this.todosTable,
          Key: {
            todoId,
            userId
          },
          UpdateExpression:
            'set #name = :name, dueDate = :dueDate, done = :done',
          ExpressionAttributeValues: {
            ':name': todoUpdate.name,
            ':dueDate': todoUpdate.dueDate,
            ':done': todoUpdate.done
          },
          ExpressionAttributeNames: {
            '#name': 'name'
          }
        })
        .promise()
    } catch (error) {
      logger.error(error.message)
    }
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    try {
      logger.info(
        `Deleting a todo with id ${todoId} for user with id ${userId}`
      )
      await this.docClient
        .delete({
          TableName: this.todosTable,
          Key: {
            todoId,
            userId
          }
        })
        .promise()
    } catch (error) {
      logger.error(error.message)
    }
  }

  async updateTodoAttachmentUrl(
    todoId: string,
    userId: string,
    attachmentUrl: string
  ): Promise<void> {
    try {
      logger.info(
        `Updating todo with id ${todoId} attachment url for user ${userId}`
      )
      await this.docClient
        .update({
          TableName: this.todosTable,
          Key: {
            todoId,
            userId
          },
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': attachmentUrl
          }
        })
        .promise()
    } catch (error) {
      logger.error(error.message)
    }
  }
}

const createDynamoDBClient = () => new XAWS.DynamoDB.DocumentClient()