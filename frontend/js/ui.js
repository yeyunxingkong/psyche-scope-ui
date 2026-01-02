// UI 渲染与交互
import { state, updateWallet, isUnlocked, markUnlocked, getCurrentMode } from './state.js';

// 切换 Tab
export function switchTab(tabId) {
  const mode = getCurrentMode();
  const tabContainer = mode === 'user' ? '#user-tabs' : '#character-tabs';
  
  document.querySelectorAll(`${tabContainer} .tab-btn`).forEach((btn) => btn.classList.remove('active'));
  const targetBtn = document.querySelector(`${tabContainer} [data-tab="${tabId}"]`);
  if (targetBtn) {
    targetBtn.classList.add('active');
  }
  
  document.querySelectorAll('.module-section').forEach((sec) => sec.classList.remove('active'));
  const targetModule = document.getElementById('module-' + tabId);
  if (targetModule) {
    targetModule.classList.add('active');
  }
}

// 切换面板模式 (角色/用户)
export function switchPanelMode(mode) {
  const characterTabs = document.getElementById('character-tabs');
  const userTabs = document.getElementById('user-tabs');
  const telemetryPanel = document.getElementById('telemetry-panel');
  const userTelemetryPanel = document.getElementById('user-telemetry-panel');
  const visualFeed = document.querySelector('.visual-feed');
  const userVisualFeed = document.getElementById('user-visual-feed');
  
  if (mode === 'user') {
    characterTabs.style.display = 'none';
    userTabs.style.display = 'flex';
    if (telemetryPanel) telemetryPanel.style.display = 'none';
    if (userTelemetryPanel) userTelemetryPanel.style.display = 'block';
    if (visualFeed) visualFeed.style.display = 'none';
    if (userVisualFeed) userVisualFeed.style.display = 'flex';
    
    // 激活用户状态 Tab
    document.querySelectorAll('.module-section').forEach((sec) => sec.classList.remove('active'));
    document.getElementById('module-user-status')?.classList.add('active');
    
    // 重置用户面板 Tab 按钮状态
    document.querySelectorAll('#user-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('#user-tabs [data-tab="user-status"]')?.classList.add('active');
    
    // 更新用户面板按钮状态
    document.getElementById('user-panel-btn')?.classList.add('active');
    document.querySelectorAll('.character-item').forEach(item => item.classList.remove('active'));
  } else {
    characterTabs.style.display = 'flex';
    userTabs.style.display = 'none';
    if (telemetryPanel) telemetryPanel.style.display = 'block';
    if (userTelemetryPanel) userTelemetryPanel.style.display = 'none';
    if (visualFeed) visualFeed.style.display = 'flex';
    if (userVisualFeed) userVisualFeed.style.display = 'none';
    
    // 激活第一个角色 Tab
    document.querySelectorAll('.module-section').forEach((sec) => sec.classList.remove('active'));
    document.getElementById('module-track')?.classList.add('active');
    
    // 更新用户面板按钮状态
    document.getElementById('user-panel-btn')?.classList.remove('active');
  }
}

// 渲染角色列表
export function renderCharacterList(characters, currentId, onSelect) {
  const container = document.getElementById('character-list');
  if (!container) return;
  
  container.innerHTML = characters.map(char => `
    <div class="character-item ${char.id === currentId ? 'active' : ''}" data-id="${char.id}">
      <span class="char-avatar">${char.avatar || '👤'}</span>
      <span class="char-name">${char.name}</span>
      <span class="char-id">${char.id}</span>
    </div>
  `).join('');
  
  // 绑定点击事件
  container.querySelectorAll('.character-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      onSelect(id);
    });
  });
}

// 更新角色选中状态
export function updateCharacterSelection(characterId) {
  document.querySelectorAll('.character-item').forEach(item => {
    item.classList.toggle('active', item.dataset.id === characterId);
  });
  document.getElementById('user-panel-btn')?.classList.remove('active');
}

// 解锁项目
export function unlockItem(lockId, cost) {
  if (isUnlocked(lockId)) return;

  if (state.wallet >= cost) {
    updateWallet(-cost);
    markUnlocked(lockId);

    const lockElement = document.getElementById('lock-' + lockId);
    if (lockElement) {
      lockElement.style.opacity = '0';
      setTimeout(() => {
        lockElement.classList.add('unlocked');
        lockElement.style.display = 'none';
      }, 500);
    }
    console.log(`解锁成功: -${cost} CR`);
  } else {
    showModal(`余额不足！<br>需要 ${cost} CR`);
  }
}

// 显示弹窗
export function showModal(msg) {
  document.getElementById('modalMsg').innerHTML = msg;
  document.getElementById('modal').classList.add('show');
}

// 关闭弹窗
export function closeModal() {
  document.getElementById('modal').classList.remove('show');
}

// 设置数值显示
export function setVal(id, value, colorClass = '') {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value;
    if (colorClass) el.className = `data-value ${colorClass}`;
  }
}

// 更新进度条
export function updateBar(barId, value, barClass) {
  const barEl = document.getElementById(barId);
  if (barEl) {
    barEl.style.width = `${value}%`;
    barEl.setAttribute('data-percent', `${value}%`);
    if (barClass) barEl.className = `bar-fill ${barClass}`;
  }
}
