import axios from 'axios';

export async function fetchConfluencePages(
  domain: string,
  spaceKey: string,
  accessToken: string,
  contentType: 'page' | 'blogpost' | 'all' = 'page'
) {
  let typeParam = '';
  if (contentType === 'page' || contentType === 'blogpost') {
    typeParam = `&type=${contentType}`;
  } else if (contentType === 'all') {
    typeParam = '&type=page,blogpost';
  }
  const url = `https://${domain}/wiki/rest/api/content?spaceKey=${spaceKey}${typeParam}&expand=body.storage`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });
    return response.data.results;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
}
