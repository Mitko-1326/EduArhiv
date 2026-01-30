
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

function AuditListItem(number, timestamp) {
  const aitem = document.createElement('div')
  aitem.className = 'audititem'

  const date = new Date(timestamp * 1000);
  const time = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours}:${date.getMinutes}`
  
  card.innerHTML = `
    <p> ${number} </p>
    <p> ${time} </p>
  `

  aitem.addEventListener('click', () => {
    aitem.forEach(c => c.classList.remove('selected'));
    aitem.classList.add('selected')
  })
}

function displayAuditOptions(items) {
  const container = document.querySelector('dialog')
  container.innerHTML = '';

  if (!items || !Array.isArray(items)) {
    console.error("not an array ", items);
    return;
  }

  if (items.length === 0) {
    console.error("no items in array");
    return;
  }

  for (item in items) {
    let number = item;
    let timestamp = items[item].timestamp;

    const auditItem = AuditListItem(number, timestamp)

    container.appendChild(auditItem);
  }

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