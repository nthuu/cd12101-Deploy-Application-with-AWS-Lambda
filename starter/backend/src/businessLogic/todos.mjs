import * as uuid from 'uuid'
import { TodosAccess } from "../dataLayer/todosAccess.mjs";

const todosAccess = new TodosAccess();

export async function getTodos(userId) {
    return await todosAccess.getTodos(userId);
}

export async function updateTodo(userId, todoId, request) {
    return await todosAccess.updateTodo(userId, todoId, request);
}

export async function createTodo(request, userId) {
    const todoItem = {
        todoId: uuid.v4(),
        userId: userId,
        attachmentUrl: null,
        dueDate: request.dueDate,
        createdAt: new Date().toISOString(),
        name: request.name,
        done: false
    }

    return await todosAccess.createTodo(todoItem);
}

export async function deleteTodo(userId, todoId) {
    return await todosAccess.deteteTodo(userId, todoId);
}

export async function generateUploadUrl(userId, todoId) {
    return await todosAccess.generateUploadUrl(userId, todoId);
}