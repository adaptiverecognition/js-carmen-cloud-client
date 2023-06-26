import fs from 'fs';

export function extractAPIVersionFromReadme(apiName: string): string {
  const readme = fs.readFileSync('./README.md', 'utf8');
  const regex = new RegExp(`- ${apiName}: v([0-9]\\.[0-9])`);
  const match = readme.match(regex);
  return match ? match[1] : '';
}