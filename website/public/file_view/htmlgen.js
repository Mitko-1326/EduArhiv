
function FileCard(file) {
  const card = document.createElement('div');
  card.className = 'file-card';
  // Add dataset.path for retrieval later
  card.dataset.path = file.path; 
  
  card.innerHTML = `
    <img src="/images/file.png" alt="File Icon" class="file-icon">
    <p>${file.name}</p>
  `;
    
  card.addEventListener('dblclick', () => {
    window.open(`/download?path=${encodeURIComponent(file.path)}`);
  });
  
  return card;
}

function FolderCard(folder) {
  const card = document.createElement('div');
  card.className = 'file-card';
  // Add dataset.path
  card.dataset.path = folder.path;
  
  card.innerHTML = `
    <img src="/images/folder.png" alt="Folder Icon" class="file-icon">
    <p>${folder.name}</p>
  `;

  card.addEventListener('dblclick', () => {
    window.navigateTo(folder.path);
  });
  
  return card;
}

function AuditListItem(number, timestamp, filePath) {
  const aitem = document.createElement('div')
  aitem.className = 'audititem'

  const date = new Date(timestamp);
  const time = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
  aitem.innerHTML = `
      <div class="audititem-content">
      <p>Version ${number}</p>
      <p>${time}</p>
      <button class="rollback-btn">rollback</button>
      </div>
  `;

  aitem.querySelector('.rollback-btn').addEventListener('click', async () => {
      await fetch(`/rollback?path=${encodeURIComponent(filePath)}&version=${number}`, {
          method: 'POST'
      });
      document.querySelector('dialog').close();
  });

  aitem.addEventListener('click', () => {
    document.querySelectorAll('.audititem').forEach(c => c.classList.remove('selected'));
    aitem.classList.add('selected')
  })

  return aitem;
}

function displayAuditOptions(items, selectedPath) {
  const container = document.querySelector('dialog');
  container.innerHTML = '';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', () => container.close());
  container.appendChild(closeBtn);

  if (!items || typeof items !== 'object') {
    console.error("invalid items", items);
    return;
  }

  if (Object.keys(items).length === 0) {
    console.error("no versions found");
    return;
  }

  for (const property in items) {
    console.log(property, items[property].timestamp, items[property].date);
    const auditItem = AuditListItem(property, items[property].timestamp, selectedPath);
    container.appendChild(auditItem);
  }



  container.showModal();
}

function displayFilesAndFolders(items) {
  const container = document.querySelector('.mainarea');
  container.innerHTML = '';
  
  if (!items || !Array.isArray(items)) {
    console.error('Items is not an array:', items);
    container.innerHTML = '<p>Error loading files</p>';
    return;
  }
  
  if (items.length === 0) {
    container.innerHTML = '<p>No files or folders here</p>';
    return;
  }
  
  items.forEach(item => {
    let card;
    if (item.type === 'directory') {
      card = FolderCard(item);
    } else {
      card = FileCard(item);
    }
    container.appendChild(card);
  });
}

export { displayFilesAndFolders, displayAuditOptions };