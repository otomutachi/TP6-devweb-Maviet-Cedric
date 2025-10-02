const originURL = "https://tp6-devweb-maviet-cedric.onrender.com/";

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
    const formData = new FormData();
    formData.append('url', url);

    const response = await fetch(`${originURL}api-v2/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    shortUrlPara.textContent = `Shortened URL: ${data.short_url}`;
    resultDiv.classList.remove('hidden');
    copyButton.onclick = () => {
      navigator.clipboard.writeText(data.short_url).then(() => {
        alert('URL copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy URL: ', err);
      });
    };
  } catch (err) {
    errorPara.textContent = `Error: ${err.message}`;
    resultDiv.classList.remove('hidden');
  }
});