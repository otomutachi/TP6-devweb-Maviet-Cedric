const originURL = "http://localhost:8080/"; 

document.getElementById('submit-link').addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('url').value;
  const resultDiv = document.getElementById('result');
  const shortUrlPara = document.getElementById('shortUrl');
  const errorPara = document.getElementById('error');
  const copyButton = document.getElementById('copyButton');

  resultDiv.classList.add('hidden');
  errorPara.textContent = '';
  shortUrlPara.textContent = '';

  try {
    const response = await fetch(`${originURL}api-v2/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    shortUrlPara.textContent = `Shortened URL: ${data.short_url}`;
    resultDiv.classList.remove('hidden');
    copyButton.onclick = () => {
      navigator.clipboard.writeText(data.short_url).then(() => {
        alert('URL copied to clipboard!');
      }).catch(err => {
        console.error('la copie n as pas etait effectuer: ', err);
      });
    };
  } catch (err) {
    errorPara.textContent = `Error: ${err.message}`;
    resultDiv.classList.remove('hidden');
  }
});