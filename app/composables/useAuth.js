export function useAuth() {
  const loggedUser = useState('loggedUser', () => null)

  function login(user) {
    loggedUser.value = user
  }

  function logout() {
    loggedUser.value = null
  }

  return {
    loggedUser,
    login,
    logout
  }
}
