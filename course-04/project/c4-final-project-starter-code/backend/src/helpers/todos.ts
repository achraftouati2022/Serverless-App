import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'

// TODO: Implement businessLogic
const logger = createLogger('TodosBusinessLogic')

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

// Get Todos
export const getTodosForUser = (userId: string): Promise<TodoItem[]> => {
  try {
    logger.info(`Getting todos for specific user with id ${userId}`)
    return todosAccess.getTodosForUser(userId)
  } catch (error) {
    logger.error(error.message)
  }
}

// Create Todo
export const createTodo = async (
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> => {
  try {
    logger.info(`Creating a new todo for user with id ${userId}`)
    const todoId: string = uuid.v4()
    const newItem: TodoItem = {
      userId,
      todoId,
      createdAt: new Date().toISOString(),
      done: false,
      ...createTodoRequest
    }

    return await todosAccess.createTodo(newItem)
  } catch (error) {
    logger.error(error.message)
  }
}

//Update Todo
export const updateTodo = async (
  todoId: string,
  userId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void> => {
  try {
    logger.info(`Updating a todo with id ${todoId} for user with id ${userId}`)
    await todosAccess.updateTodo(todoId, userId, updateTodoRequest)
  } catch (error) {
    logger.error(error.message)
  }
}

// Delete Todo
export const deleteTodo = async (
  todoId: string,
  userId: string
): Promise<void> => {
  try {
    logger.info(`Deleting a todo with id ${todoId} for user with id ${userId}`)
    return await todosAccess.deleteTodo(todoId, userId)
  } catch (error) {
    logger.error(error.message)
  }
}
// Generate Upload Url for a Todo
export const generateUploadUrl = async (
  todoId: string,
  userId: string
): Promise<string> => {
  try {
    logger.info(
      `Generating upload url for todo with id ${todoId} for user with id ${userId}`
    )
    const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
    await todosAccess.updateTodoAttachmentUrl(todoId, userId, attachmentUrl)
    return attachmentUtils.getUploadUrl(todoId)
  } catch (error) {
    logger.error(error.message)
  }
}