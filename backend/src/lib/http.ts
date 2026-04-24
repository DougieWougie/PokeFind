import axios from 'axios';

// Shared axios instance with browser-like headers to avoid trivial blocks
export const http = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-GB,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
  },
});

export async function fetchHtml(url: string): Promise<string> {
  const res = await http.get<string>(url);
  return res.data;
}
