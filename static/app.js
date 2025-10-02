const originURL = "https://tp6-devweb-maviet-cedric.onrender.com/";

let lastShortUrl = null;
let lastSecret = null;

function showResult(shortUrl, secret) {
  const resultDiv = document.getElementById('result');
  const shortUrlPara = document.getElementById('shortUrl');
  const errorPara = document.getElementById('error');
  const copyButton = document.getElementById('copyButton');

  shortUrlPara.innerHTML = `Shortened URL: <a href="${shortUrl}" target="_blank">${shortUrl}</a>`;
  resultDiv.classList.remove('hidden');
  errorPara.textContent = '';
  lastShortUrl = shortUrl;
  lastSecret = secret;

  copyButton.onclick = () => {
    navigator.clipboard.writeText(shortUrl).then(() => {
      alert('URL copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy URL: ', err);
    });
  };

  let deleteBtn = document.getElementById('deleteButton');
  if (deleteBtn) deleteBtn.remove();
  if (secret) {
    deleteBtn = document.createElement('button');
    deleteBtn.id = 'deleteButton';
    deleteBtn.textContent = 'Supprimer ce lien';
    deleteBtn.onclick = async () => {
      if (!confirm('Supprimer ce lien ?')) return;
      const urlPart = shortUrl.split('/').pop();
      try {
        const response = await fetch(`${originURL}api-v2/${urlPart}`, {
          method: 'DELETE',
          headers: { 'X-API-Key': secret }
        });
        if (response.ok) {
          alert('Lien supprimé !');
          resultDiv.classList.add('hidden');
        } else {
          let data = {};
          try { data = await response.json(); } catch(e) {}
          alert('Erreur : ' + (data.error || 'Suppression impossible'));
        }
      } catch (err) {
        alert('Erreur réseau : ' + err.message);
      }
    };
    resultDiv.appendChild(deleteBtn);
  }
}

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
    const params = new URLSearchParams();
    params.append('url', url);

    const response = await fetch(`${originURL}api-v2/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    showResult(data.short_url, data.secret);
  } catch (err) {
    errorPara.textContent = `Error: ${err.message}`;
    resultDiv.classList.remove('hidden');
  }
});