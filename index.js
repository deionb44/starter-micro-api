const express = require('express');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());  // Middleware to parse JSON requests

app.post('/runPython', (req, res) => {
    const url = req.body.url;

    exec(`python your_python_script.py "${url}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send({ error: 'Failed to execute python script.' });
        }
        res.send({ data: stdout });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
