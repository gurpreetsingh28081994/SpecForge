import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchJiraIssues } from './integrations/jira';
import { fetchConfluencePages } from './integrations/confluence';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Jira ingestion endpoint with env fallback
app.post('/api/ingest/jira', async (req, res) => {
  const domain = req.body.domain || process.env.JIRA_DOMAIN;
  const projectKey = req.body.projectKey;
  const accessToken = req.body.accessToken || process.env.JIRA_ACCESS_TOKEN;
  if (!domain || !projectKey || !accessToken) {
    return res.status(400).json({ error: 'Missing required fields: domain, projectKey, accessToken' });
  }
  try {

    const issues = await fetchJiraIssues("wiki.telekom.de", "OAGGARD", accessToken);
    res.json({ issues });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Confluence ingestion endpoint with env fallback
app.post('/api/ingest/confluence', async (req, res) => {
  const domain = req.body.domain || process.env.CONFLUENCE_DOMAIN;
  const spaceKey = req.body.spaceKey;
  const accessToken = req.body.accessToken || process.env.CONFLUENCE_ACCESS_TOKEN;
  const contentType = req.body.contentType || 'page';
  if (!domain || !spaceKey || !accessToken) {
    return res.status(400).json({ error: 'Missing required fields: domain, spaceKey, accessToken' });
  }
  try {
    const pages = await fetchConfluencePages("wiki.telekom.de", "OAGGARD", accessToken, contentType);
    res.json({ pages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
