export function useAuth() {
  const loggedUserCookie = useCookie(
    'taskflow_logged_user',
    {
      default: () => null,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      path: '/'
    }
  )

  const loggedUser = useState(
    'loggedUser',
    () => loggedUserCookie.value
  )

  function login(user) {
    const safeUser = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      login: user.login,
      role: user.role
    }

    loggedUser.value = safeUser
    loggedUserCookie.value = safeUser
  }

  function logout() {
    loggedUser.value = null
    loggedUserCookie.value = null
  }

  return {
    loggedUser,
    login,
    logout
  }
}