import axios from 'axios';

export async function fetchJiraIssues(domain: string, projectKey: string, accessToken: string) {
  const url = `https://${domain}/rest/api/3/search?jql=project=${projectKey}`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });
    return response.data.issues;
  } catch (error: any) {
    throw new Error(error.response?.data?.errorMessages?.join(', ') || error.message);
  }
}
