const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const API_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQyNTMzODE0LCJpYXQiOjE3NDI1MzM1MTQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjU2ZjVjM2IzLTZhMWMtNDYwNy1iZDdhLTRkMzA0Y2NjYTAyNyIsInN1YiI6InVnY2V0MjIwNjkyQHJldmEuZWR1LmluIn0sImNvbXBhbnlOYW1lIjoiUHJhZHl1bW5hQUoiLCJjbGllbnRJRCI6IjU2ZjVjM2IzLTZhMWMtNDYwNy1iZDdhLTRkMzA0Y2NjYTAyNyIsImNsaWVudFNlY3JldCI6IlRGdWZLTHhudmpHZW10S1QiLCJvd25lck5hbWUiOiJQcmFkeXVtbm5hIEF2aW5hc2ggSmF2YWxhZ2kiLCJvd25lckVtYWlsIjoidWdjZXQyMjA2OTJAcmV2YS5lZHUuaW4iLCJyb2xsTm8iOiJSMjJFSjAxMyJ9.gGPFl_hgGf16zFa8GiWZh0JfAfw6YVntzw2OBx-7FhE";

const API_URLS = {
    p: 'http://20.244.56.144/test/primes',
    f: 'http://20.244.56.144/test/fibo',
    e: 'http://20.244.56.144/test/even',
    r: 'http://20.244.56.144/test/rand',
};

let numberWindow = [];

async function fetchNumbers(type) {
    if (!API_URLS[type]) return [];
    
    try {
        const source = axios.CancelToken.source();
        setTimeout(() => source.cancel(), 500);
        
        const response = await axios.get(API_URLS[type], {
            headers: { Authorization: API_TOKEN },
            cancelToken: source.token,
        });
        
        return response.data.numbers || [];
    } catch (error) {
        return [];
    }
}

app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    if (!API_URLS[numberid]) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }
    
    const prevState = [...numberWindow];
    const newNumbers = await fetchNumbers(numberid);
    
    newNumbers.forEach(num => {
        if (!numberWindow.includes(num)) {
            if (numberWindow.length >= WINDOW_SIZE) {
                numberWindow.shift();
            }
            numberWindow.push(num);
        }
    });
    
    const avg = numberWindow.length ? (numberWindow.reduce((a, b) => a + b, 0) / numberWindow.length).toFixed(2) : 0;
    
    res.json({
        windowPrevState: prevState,
        windowCurrState: numberWindow,
        numbers: newNumbers,
        avg: parseFloat(avg),
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
