export default async ({ appParameters }) => {
  return {
    authorizeUri: 'https://oauth.pipedrive.com/oauth/authorize',
    tokenUri: 'https://oauth.pipedrive.com/oauth/token',
    clientId: appParameters.clientId,
    clientSecret: appParameters.clientSecret,
  }
}