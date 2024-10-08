const CLIENT_ID = import.meta.env.VITE_GITHUB_OAUTH_CLIENT_ID

export const getRedirectUri = () => {
  const location = window.location
  const searchParams = new URLSearchParams(location.search)
  const redirectUri = '/'
  const url = `${location.origin}/auth/github/callback?redirect_uri=${encodeURIComponent(redirectUri)}`
  return url
}

export const githubOAuthUri = () => {
  return `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=https://board.gitfluid.rootmud.xyz/auth/github/callback&response_type=code&scope=user:email,repo`
}

export const githubOAuthContentUri = () => {
  return `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=https://board.gitfluid.rootmud.xyz/auth/github/callback&response_type=code&scope=user:email,repo&prompt=consent`
}
