import { component$, $, useStore, useContext } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { AppContext } from '~/routes/layout';

const USER_SERVICE_URL = 'http://localhost:8001';

export default component$(() => {
  const appState = useContext(AppContext);
  const authState = useStore({
    showLogin: true,
    authForm: {
      username: '',
      email: '',
      password: '',
    },
  });

  const login = $(async () => {
    try {
      const response = await fetch(`${USER_SERVICE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authState.authForm.username,
          password: authState.authForm.password,
        }),
      });

      if (response.ok) {
        const { access_token } = await response.json();
        const userData = {
          id: 1,
          username: authState.authForm.username,
          email: authState.authForm.username + '@example.com',
        };
        
        appState.token = access_token;
        localStorage.setItem('token', access_token);
        appState.user = userData;
        localStorage.setItem('user', JSON.stringify(userData));

      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed');
    }
  });

  const register = $(async () => {
    try {
      const response = await fetch(`${USER_SERVICE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authState.authForm),
      });

      if (response.ok) {
        alert('Registration successful! Please login.');
        authState.showLogin = true;
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed');
    }
  });

  return (
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="max-w-md w-full mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h1 class="text-2xl font-bold text-center mb-6 text-gray-900">
            DevOps Todo App
          </h1>
          <div class="flex mb-4">
            <button
              class={`flex-1 py-2 px-4 rounded-l-lg ${
                authState.showLogin ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick$={() => (authState.showLogin = true)}
            >
              Login
            </button>
            <button
              class={`flex-1 py-2 px-4 rounded-r-lg ${
                !authState.showLogin ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick$={() => (authState.showLogin = false)}
            >
              Register
            </button>
          </div>

          <div class="space-y-4">
            <input
              type="text"
              placeholder="Username"
              class="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={authState.authForm.username}
              onInput$={(e) =>
                (authState.authForm.username = (
                  e.target as HTMLInputElement
                ).value)
              }
            />
            {!authState.showLogin && (
              <input
                type="email"
                placeholder="Email"
                class="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={authState.authForm.email}
                onInput$={(e) =>
                  (authState.authForm.email = (e.target as HTMLInputElement).value)
                }
              />
            )}
            <input
              type="password"
              placeholder="Password"
              class="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={authState.authForm.password}
              onInput$={(e) =>
                (authState.authForm.password = (
                  e.target as HTMLInputElement
                ).value)
              }
            />
            <button
              class="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
              onClick$={authState.showLogin ? login : register}
            >
              {authState.showLogin ? 'Login' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Login - DevOps Todo App',
};
