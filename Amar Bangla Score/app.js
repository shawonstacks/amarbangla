let selectedItems = new Set();
let uploadedPhotoDataUrl = null;

// Safe fallback for all categories
const safeFoods = typeof foodsData !== 'undefined' ? foodsData : { title: "ফুড", items: [], badges: [] };
const safeNostalgia = typeof nostalgiaData !== 'undefined' ? nostalgiaData : { title: "নস্টালজিয়া", items: [], badges: [] };
const safeCampus = typeof campusData !== 'undefined' ? campusData : { title: "স্কুল লাইফ", items: [], badges: [] };
const safeBanglaCinema = typeof banglaCinemaData !== 'undefined' ? banglaCinemaData : { title: "বাংলা ক্লাসিক", items: [], badges: [] };

const allCategories = [
  { key: 'bangla_cinema', data: safeBanglaCinema, color: 'text-rose-600' },
  { key: 'food', data: safeFoods, color: 'text-emerald-600' },
  { key: 'nostalgia', data: safeNostalgia, color: 'text-purple-600' },
  { key: 'campus', data: safeCampus, color: 'text-blue-600' }
];

window.addEventListener('DOMContentLoaded', () => {
  renderAllCategories();
  
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.innerText = new Date().getFullYear();
  }
});

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedPhotoDataUrl = e.target.result;
    
    const previewImg = document.getElementById('photo-preview-input');
    const placeholderIcon = document.getElementById('photo-placeholder-icon');
    
    if (previewImg && placeholderIcon) {
      previewImg.src = uploadedPhotoDataUrl;
      previewImg.classList.remove('hidden');
      placeholderIcon.classList.add('hidden');
    }
  };
  reader.readAsDataURL(file);
}

function renderAllCategories() {
  const container = document.getElementById('all-categories-container');
  if (!container) return;
  
  container.innerHTML = '';

  allCategories.forEach(cat => {
    if (!cat.data || !cat.data.items || cat.data.items.length === 0) return;

    const section = document.createElement('div');
    section.className = "bg-white/80 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-emerald-900/10 transition-all mb-6";

    let itemsHTML = '';
    cat.data.items.forEach(item => {
      itemsHTML += `
        <div id="card-${item.id}" onclick="toggleSelect('${item.id}')" class="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:border-emerald-500 hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex flex-col gap-1 pr-2">
            <h4 class="font-bold text-sm text-slate-800 leading-snug">${item.name}</h4>
            <div>
              ${item.type ? `<span class="text-[9px] font-semibold bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md border border-slate-300/50 inline-block mr-1">${item.type}</span>` : ''}
              ${item.location ? `<span class="text-[9px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md inline-block">${item.location}</span>` : ''}
            </div>
          </div>
          <div id="check-${item.id}" class="check-toggle w-6 h-6 rounded-full border-2 border-slate-300 bg-slate-50 text-[10px] font-black text-slate-300 flex items-center justify-center transition-all duration-200 shadow-inner shrink-0">✓</div>
        </div>
      `;
    });

    section.innerHTML = `
      <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <h3 class="text-lg font-black ${cat.color} tracking-tight">${cat.data.title}</h3>
        <span class="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full border border-slate-200/60">${cat.data.items.length} টি আইটেম</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        ${itemsHTML}
      </div>
    `;

    container.appendChild(section);
  });

  updateCount();

  if (window.lucide) {
    lucide.createIcons();
  }
}

function toggleSelect(id) {
  const checkIcon = document.getElementById(`check-${id}`);
  const element = document.getElementById(`card-${id}`);

  if (!checkIcon || !element) return;

  if (selectedItems.has(id)) {
    selectedItems.delete(id);
    element.classList.remove('border-emerald-500', 'bg-emerald-50/80', 'shadow-sm');
    checkIcon.classList.remove('bg-emerald-600', 'border-emerald-600', 'text-white', 'shadow-sm');
    checkIcon.classList.add('border-slate-300', 'bg-slate-50', 'text-slate-300');
  } else {
    selectedItems.add(id);
    element.classList.add('border-emerald-500', 'bg-emerald-50/80', 'shadow-sm');
    checkIcon.classList.remove('border-slate-300', 'bg-slate-50', 'text-slate-300');
    checkIcon.classList.add('bg-emerald-600', 'border-emerald-600', 'text-white', 'shadow-sm');
  }
  updateCount();
}

function updateCount() {
  const countEl = document.getElementById('selected-count');
  if (countEl) {
    countEl.innerText = `${selectedItems.size} টি সিলেক্টড`;
  }
}

function generateResultCard() {
  const userNameInput = document.getElementById('user-name');
  const userName = (userNameInput && userNameInput.value.trim()) ? userNameInput.value.trim() : 'অজ্ঞাতনামা অভিযাত্রী';
  
  let categoryResults = [];
  let totalSelectedAll = 0;

  allCategories.forEach(cat => {
    if (!cat.data || !cat.data.items) return;
    const total = cat.data.items.length;
    let count = 0;

    cat.data.items.forEach(item => {
      if (selectedItems.has(item.id)) {
        count++;
        totalSelectedAll++;
      }
    });

    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    categoryResults.push({
      key: cat.key,
      title: cat.data.title,
      count: count,
      total: total,
      percentage: percentage,
      badges: cat.data.badges || []
    });
  });

  categoryResults.sort((a, b) => b.count - a.count || b.percentage - a.percentage);
  const topCategory = categoryResults[0];

  let topTitle = "";
  let topScoreText = "";
  let topDesc = "";

  if (totalSelectedAll === 0) {
    topTitle = "নতুন অভিযাত্রী 🧭";
    topScoreText = "এখনো কোনো স্মৃতি সিলেক্ট করেননি!";
    topDesc = "তালিকা থেকে আপনার পছন্দের স্মৃতিগুলোতে টিক চিহ্ন দিন এবং আপনার আসল নস্টালজিয়া কার্ডটি আনলক করুন!";
  } else {
    topScoreText = `প্রধান ঝোঁক: ${topCategory.title} (${topCategory.count}/${topCategory.total} টি)`;

    let matchedBadge = null;
    if (topCategory.badges && topCategory.badges.length > 0) {
      for (let b of topCategory.badges) {
        if (topCategory.percentage >= b.minPercent) {
          matchedBadge = b;
          break;
        }
      }
      if (!matchedBadge) {
        matchedBadge = topCategory.badges[topCategory.badges.length - 1];
      }
    }

    if (matchedBadge) {
      topTitle = matchedBadge.title;
      topDesc = `"${matchedBadge.desc}"`;
    } else {
      topTitle = "বাংলা অভিজ্ঞতা 🎯";
      topDesc = `"আপনার অনন্য বাংলা স্মৃতি ও পছন্দের সংকলন তৈরি হয়েছে!"`;
    }
  }

  // Handle Photo Avatar Display (Hide completely if no uploaded photo)
  const avatarContainer = document.getElementById('card-avatar-container');
  const cardUserPhoto = document.getElementById('card-user-photo');

  if (uploadedPhotoDataUrl && avatarContainer && cardUserPhoto) {
    cardUserPhoto.setAttribute('src', uploadedPhotoDataUrl);
    avatarContainer.style.setProperty('display', 'block', 'important');
  } else if (avatarContainer) {
    avatarContainer.style.setProperty('display', 'none', 'important');
    if (cardUserPhoto) cardUserPhoto.removeAttribute('src');
  }

  const elUserName = document.getElementById('card-user-name');
  const elTopCat = document.getElementById('card-top-category');
  const elScoreText = document.getElementById('card-score-text');
  const elBadgeDesc = document.getElementById('card-badge-desc');

  if (elUserName) elUserName.innerText = userName;
  if (elTopCat) elTopCat.innerText = topTitle;
  if (elScoreText) elScoreText.innerText = topScoreText;
  if (elBadgeDesc) elBadgeDesc.innerText = topDesc;

  // Breakdown List
  const breakdownContainer = document.getElementById('category-breakdown-list');
  if (breakdownContainer) {
    breakdownContainer.innerHTML = '<p style="font-weight: bold; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; margin-bottom: 6px; color: #065f46; text-align: left; font-size: 11px; letter-spacing: 0;">সকল ক্যাটাগরির মার্কস:</p>';
    
    categoryResults.forEach(res => {
      breakdownContainer.innerHTML += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 2.5px 0; width: 100%; gap: 6px;">
          <span style="color: #334155; font-weight: 500; text-align: left; flex: 1; min-width: 0; word-break: break-word; line-height: 1.25; font-size: 11px; letter-spacing: 0;">${res.title}</span>
          <span style="font-weight: 800; color: #047857; text-align: right; flex-shrink: 0; white-space: nowrap; font-size: 11px; letter-spacing: 0;">${res.count}/${res.total} (${res.percentage}%)</span>
        </div>
      `;
    });
  }

  const checklistSec = document.getElementById('checklist-section');
  const resultSec = document.getElementById('result-section');
  if (checklistSec && resultSec) {
    checklistSec.classList.add('hidden');
    resultSec.classList.remove('hidden');
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function downloadCardImage() {
  const cardElement = document.getElementById('shareable-card');
  if (!cardElement) return;

  const cardUserPhoto = document.getElementById('card-user-photo');
  const avatarContainer = document.getElementById('card-avatar-container');

  if (uploadedPhotoDataUrl && cardUserPhoto && avatarContainer) {
    cardUserPhoto.src = uploadedPhotoDataUrl;
    avatarContainer.style.setProperty('display', 'block', 'important');

    await new Promise((resolve) => {
      if (cardUserPhoto.complete && cardUserPhoto.naturalWidth !== 0) {
        resolve();
      } else {
        cardUserPhoto.onload = resolve;
        cardUserPhoto.onerror = resolve;
      }
    });
  } else if (avatarContainer) {
    avatarContainer.style.setProperty('display', 'none', 'important');
  }

  window.scrollTo(0, 0);

  html2canvas(cardElement, { 
    scale: 3, 
    useCORS: true,
    allowTaint: true,
    logging: false,
    letterRendering: true,
    backgroundColor: "#FAF9F6",
    onclone: (clonedDoc) => {
      const clonedCard = clonedDoc.getElementById('shareable-card');
      const clonedPhoto = clonedDoc.getElementById('card-user-photo');
      const clonedAvatarContainer = clonedDoc.getElementById('card-avatar-container');

      if (clonedCard) {
        clonedCard.style.maxWidth = '380px';
        clonedCard.style.width = '100%';
        clonedCard.style.marginLeft = 'auto';
        clonedCard.style.marginRight = 'auto';
        clonedCard.style.textAlign = 'center';
        clonedCard.style.boxSizing = 'border-box';
      }

      if (uploadedPhotoDataUrl && clonedPhoto && clonedAvatarContainer) {
        clonedAvatarContainer.style.setProperty('display', 'block', 'important');
        clonedPhoto.setAttribute('src', uploadedPhotoDataUrl);
      } else if (clonedAvatarContainer) {
        clonedAvatarContainer.style.setProperty('display', 'none', 'important');
        if (clonedPhoto) clonedPhoto.removeAttribute('src');
      }
    }
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `my-amar-bangla-card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

function shareToFacebook() {
  const shareUrl = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
}

function goToResultSection() {
  const resultSection = document.getElementById('result-section');
  if (resultSection) {
    if (resultSection.classList.contains('hidden')) {
      generateResultCard();
    } else {
      resultSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function resetApp() {
  selectedItems.clear();
  uploadedPhotoDataUrl = null;
  
  const userNameInput = document.getElementById('user-name');
  const userPhotoInput = document.getElementById('user-photo-input');
  if (userNameInput) userNameInput.value = '';
  if (userPhotoInput) userPhotoInput.value = '';
  
  const previewImg = document.getElementById('photo-preview-input');
  const placeholderIcon = document.getElementById('photo-placeholder-icon');
  if (previewImg && placeholderIcon) {
    previewImg.src = '';
    previewImg.classList.add('hidden');
    placeholderIcon.classList.remove('hidden');
  }

  const resultSec = document.getElementById('result-section');
  const checklistSec = document.getElementById('checklist-section');
  if (resultSec && checklistSec) {
    resultSec.classList.add('hidden');
    checklistSec.classList.remove('hidden');
  }

  renderAllCategories();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
