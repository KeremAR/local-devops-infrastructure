import { component$, $, useStore, useContext, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { AppContext } from '~/routes/layout';
import type { Todo } from '~/types';

const TODO_SERVICE_URL = 'http://localhost:8002';

export default component$(() => {
  const appState = useContext(AppContext);
  const todoState = useStore({
    todos: [] as Todo[],
    newTodo: { title: '', description: '' },
  });

  const fetchTodos = $(async (authToken: string) => {
    try {
      const response = await fetch(`${TODO_SERVICE_URL}/todos`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        todoState.todos = await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => appState.token);
    if (appState.token) {
      fetchTodos(appState.token);
    }
  });

  const createTodo = $(async () => {
    if (!todoState.newTodo.title.trim()) return;
    try {
      const response = await fetch(`${TODO_SERVICE_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${appState.token}`,
        },
        body: JSON.stringify(todoState.newTodo),
      });
      if (response.ok) {
        const newTodo = await response.json();
        todoState.todos = [newTodo, ...todoState.todos];
        todoState.newTodo = { title: '', description: '' };
      } else {
        alert('Failed to create todo');
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
      alert('Failed to create todo');
    }
  });

  const toggleTodo = $(async (todoId: number, completed: boolean) => {
    try {
      const response = await fetch(`${TODO_SERVICE_URL}/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${appState.token}`,
        },
        body: JSON.stringify({ completed }),
      });
      if (response.ok) {
        const updatedTodo = await response.json();
        todoState.todos = todoState.todos.map((todo) =>
          todo.id === todoId ? updatedTodo : todo
        );
      } else {
        alert('Failed to update todo');
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
      alert('Failed to update todo');
    }
  });

  const deleteTodo = $(async (todoId: number) => {
    try {
      const response = await fetch(`${TODO_SERVICE_URL}/todos/${todoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${appState.token}` },
      });
      if (response.ok) {
        todoState.todos = todoState.todos.filter((todo) => todo.id !== todoId);
      } else {
        alert('Failed to delete todo');
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
      alert('Failed to delete todo');
    }
  });

  const logout = $(() => {
    appState.user = null;
    appState.token = '';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  });

  return (
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow-sm border-b">
        <div class="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">DevOps Todo App</h1>
          {appState.user && (
            <div class="flex items-center space-x-4">
              <span class="text-gray-600">
                Welcome, {appState.user.username}!
              </span>
              <button
                onClick$={logout}
                class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <main class="max-w-4xl mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4">Add New Todo</h3>
          <div class="space-y-4">
            <input
              type="text"
              placeholder="Todo title"
              class="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={todoState.newTodo.title}
              onInput$={(e) =>
                (todoState.newTodo.title = (e.target as HTMLInputElement).value)
              }
            />
            <textarea
              placeholder="Description (optional)"
              class="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              value={todoState.newTodo.description}
              onInput$={(e) =>
                (todoState.newTodo.description = (
                  e.target as HTMLInputElement
                ).value)
              }
            />
            <button
              onClick$={createTodo}
              class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Add Todo
            </button>
          </div>
        </div>

        <div class="space-y-4">
          {todoState.todos.map((todo) => (
            <div key={todo.id} class="bg-white rounded-lg shadow-md p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange$={(e) =>
                        toggleTodo(todo.id, (e.target as HTMLInputElement).checked)
                      }
                      class="mr-3 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <h4
                      class={`text-lg font-medium ${
                        todo.completed ? 'line-through text-gray-500' : ''
                      }`}
                    >
                      {todo.title}
                    </h4>
                  </div>
                  {todo.description && (
                    <p
                      class={`text-gray-600 ml-7 ${
                        todo.completed ? 'line-through' : ''
                      }`}
                    >
                      {todo.description}
                    </p>
                  )}
                  <p class="text-sm text-gray-400 ml-7 mt-2">
                    Created: {new Date(todo.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick$={() => deleteTodo(todo.id)}
                  class="text-red-500 hover:text-red-700 ml-4"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {todoState.todos.length === 0 && (
            <div class="text-center text-gray-500 py-8">
              No todos yet. Create your first todo above!
            </div>
          )}
        </div>
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'DevOps Todo App',
  meta: [
    {
      name: 'description',
      content: 'Qwik site description',
    },
  ],
};
