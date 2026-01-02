// 主入口文件
import '../styles/main.css';
import { 
  state, 
  getCurrentCharacter, 
  setCurrentCharacter, 
  switchToUserPanel, 
  switchToCharacterPanel,
  getAllCharacters,
  getUserData,
  getCurrentMode
} from './state.js';
import { 
  switchTab, 
  switchPanelMode, 
  renderCharacterList, 
  updateCharacterSelection,
  unlockItem, 
  closeModal,
  showModal,
  setVal, 
  updateBar 
} from './ui.js';

// 初始化应用
function initApp() {
  // 渲染角色列表
  renderCharacterList(getAllCharacters(), state.currentCharacterId, handleCharacterSelect);
  
  // 渲染当前角色数据
  renderCurrentCharacter();
  
  // 渲染用户状态数据
  renderUserStatusData();
  
  // 渲染用户任务数据
  renderTasksData();
  
  // 渲染 SNS 数据
  renderSNSData();
  
  // 渲染元数据 (日期、倒计时等)
  renderMetaData();
  
  // 绑定事件
  bindEvents();
  
  // 显示钱包余额
  document.getElementById('walletDisplay').textContent = state.wallet.toLocaleString();
}

// 渲染元数据 (日期、违约倒计时等)
function renderMetaData() {
  const { meta } = state;
  if (!meta) return;
  
  // 当前日期
  const currentDateEl = document.getElementById('currentDateDisplay');
  if (currentDateEl && meta.currentDate) {
    currentDateEl.textContent = meta.currentDate;
  }
  
  // 负债利率
  const debtRateEl = document.getElementById('debtRateDisplay');
  if (debtRateEl && meta.debtRate) {
    debtRateEl.textContent = meta.debtRate;
  }
  
  // 违约倒计时
  const daysLeftEl = document.getElementById('daysLeftDisplay');
  if (daysLeftEl && meta.days !== undefined) {
    daysLeftEl.textContent = meta.days;
    // 根据剩余天数改变颜色
    if (meta.days <= 7) {
      daysLeftEl.style.color = '#f33';
    } else if (meta.days <= 14) {
      daysLeftEl.style.color = '#fc0';
    } else {
      daysLeftEl.style.color = '#0f9';
    }
  }
}

// 处理角色选择
function handleCharacterSelect(characterId) {
  if (setCurrentCharacter(characterId)) {
    updateCharacterSelection(characterId);
    switchPanelMode('character');
    renderCurrentCharacter();
  }
}

// 渲染当前角色的所有数据
function renderCurrentCharacter() {
  const character = getCurrentCharacter();
  if (!character) return;
  
  // 更新目标名称
  setVal('val-target', character.id);
  
  renderBasicData(character);
  renderTrackData(character);
  renderMetrics(character);
  renderMindData(character);
  renderBodyData(character);
  renderDevData(character);
  renderStatsData(character);
  renderFirstsData(character);
  renderRecentContacts(character);
  renderOutfitData(character);
}

// 渲染用户状态数据
function renderUserStatusData() {
  const userData = getUserData();
  if (!userData) return;

  // 基础状态
  const { status } = userData;
  if (status) {
    const healthLabel = getStatusLabel(status.health, 'health');
    setVal('val-user-health', `${status.health}% (${healthLabel})`, 'val-green');
    updateBar('bar-user-health', status.health, 'bar-health');

    const stressLabel = getStatusLabel(status.stress, 'stress');
    setVal('val-user-stress', `${status.stress}% (${stressLabel})`, 'val-gold');
    updateBar('bar-user-stress', status.stress, 'bar-stress');

    const fatigueLabel = getStatusLabel(status.fatigue, 'fatigue');
    setVal('val-user-fatigue', `${status.fatigue}% (${fatigueLabel})`, 'val-blue');
    updateBar('bar-user-fatigue', status.fatigue, 'bar-wet');

    // 侧边栏状态
    setVal('val-side-health', `${status.health}%`, 'val-green');
    updateBar('bar-side-health', status.health, 'bar-health');
    setVal('val-side-stress', `${status.stress}%`, 'val-gold');
    updateBar('bar-side-stress', status.stress, 'bar-stress');
    setVal('val-side-fatigue', `${status.fatigue}%`, 'val-blue');
    updateBar('bar-side-fatigue', status.fatigue, 'bar-wet');

    // 状态提示
    renderStatusTips(status);
  }

  // 学业状态
  const { academic } = userData;
  if (academic) {
    setVal('val-user-class', academic.class || '--');
    const gpaPercent = (academic.gpa / 4.0) * 100;
    const gpaColor = academic.gpa >= 3.0 ? 'val-green' : academic.gpa >= 2.0 ? 'val-gold' : 'val-red';
    setVal('val-user-gpa', `${academic.gpa.toFixed(1)} / 4.0`, gpaColor);
    updateBar('bar-user-gpa', gpaPercent, '');
    setVal('val-user-gpa-label', academic.gpaLabel || '--', gpaColor);
  }

  // 身体素质
  const { body } = userData;
  if (body) {
    setVal('val-body-strength', `${body.strength}/100`);
    updateBar('bar-body-strength', body.strength, 'bar-strength');

    setVal('val-body-agility', `${body.agility}/100`);
    updateBar('bar-body-agility', body.agility, 'bar-agility');

    setVal('val-body-stamina', `${body.stamina}/100`);
    updateBar('bar-body-stamina', body.stamina, 'bar-stamina');

    setVal('val-body-charm', `${body.charm}/100`);
    updateBar('bar-body-charm', body.charm, 'bar-charm');

    setVal('val-body-intelligence', `${body.intelligence}/100`);
    updateBar('bar-body-intelligence', body.intelligence, 'bar-intel');

    // 综合评估
    const total = Math.round((body.strength + body.agility + body.stamina + body.charm + body.intelligence) / 5);
    setVal('val-body-total', `${total}/100`, 'val-gold');
    setVal('val-body-rank', getRankLabel(total), getRankColor(total));
  }

  // 仓库
  renderInventory(userData.inventory);
  
  // 网购
  renderShop(userData.shop);
}

// 获取状态标签
function getStatusLabel(value, type) {
  if (type === 'health') {
    if (value > 80) return 'Excellent';
    if (value > 50) return 'Good';
    if (value > 20) return 'Weak';
    return 'Critical';
  }
  if (type === 'stress' || type === 'fatigue') {
    if (value > 80) return 'CRITICAL';
    if (value > 50) return 'High';
    if (value > 20) return 'Normal';
    return 'Low';
  }
  return 'Normal';
}

// 渲染状态提示
function renderStatusTips(status) {
  const tips = [];
  if (status.health < 30) tips.push('⚠️ 健康状况不佳，建议休息恢复');
  if (status.stress > 70) tips.push('⚠️ 压力过大，可能影响判断力');
  if (status.fatigue > 70) tips.push('⚠️ 疲劳度过高，行动效率下降');
  if (status.health > 80 && status.stress < 30 && status.fatigue < 30) {
    tips.push('✅ 状态良好，适合执行任务');
  }
  
  const container = document.getElementById('user-status-tips');
  if (container) {
    container.innerHTML = tips.length > 0 
      ? tips.map(t => `<div style="margin-bottom:5px;">${t}</div>`).join('')
      : '<div style="color:#0f9;">✅ 一切正常</div>';
  }
}

// 获取等级标签
function getRankLabel(value) {
  if (value >= 90) return 'S (Elite)';
  if (value >= 80) return 'A (Excellent)';
  if (value >= 60) return 'B (Good)';
  if (value >= 40) return 'C (Average)';
  return 'D (Weak)';
}

// 获取等级颜色
function getRankColor(value) {
  if (value >= 90) return 'val-gold';
  if (value >= 80) return 'val-purple';
  if (value >= 60) return 'val-blue';
  return 'val-grey';
}

// 渲染仓库
function renderInventory(inventory) {
  const container = document.getElementById('inventory-list');
  if (!container || !inventory) return;

  const userData = getUserData();
  const pendingItems = userData.pendingDelivery || [];

  // 可用物品
  const availableHtml = inventory.map(item => `
    <div class="inventory-item ${item.available !== false ? '' : 'item-unavailable'}">
      <div class="item-header">
        <span class="item-name">${item.name}</span>
        <span class="item-count">x${item.count}</span>
      </div>
      <div class="item-desc">${item.desc}</div>
      ${item.available !== false ? '<div class="item-status available">✅ 可用</div>' : '<div class="item-status unavailable">⏳ 配送中</div>'}
    </div>
  `).join('');

  // 待配送物品
  const pendingHtml = pendingItems.length > 0 ? `
    <div class="pending-section">
      <div class="pending-title">📦 待配送 (Pending Delivery)</div>
      ${pendingItems.map(item => `
        <div class="inventory-item item-pending">
          <div class="item-header">
            <span class="item-name">${item.name}</span>
            <span class="item-count">x${item.count}</span>
          </div>
          <div class="item-desc">${item.desc}</div>
          <div class="item-status pending">🚚 预计 ${item.daysLeft} 天后到达</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  container.innerHTML = availableHtml + pendingHtml;

  setVal('val-inv-types', `${inventory.length} 种`);
  const totalCount = inventory.reduce((sum, item) => sum + item.count, 0);
  setVal('val-inv-total', `${totalCount} 个`);
  
  // 待配送数量
  const pendingCount = pendingItems.reduce((sum, item) => sum + item.count, 0);
  if (pendingCount > 0) {
    setVal('val-inv-pending', `${pendingCount} 个配送中`, 'val-gold');
  } else {
    setVal('val-inv-pending', '无', 'val-grey');
  }
}

// 渲染网购商城
function renderShop(shop) {
  const container = document.getElementById('shop-list');
  if (!container || !shop) return;

  container.innerHTML = shop.map(item => `
    <div class="shop-item" data-id="${item.id}" data-price="${item.price}" data-name="${item.name}">
      <div class="shop-item-header">
        <span class="shop-item-name">${item.name}</span>
        <span class="shop-item-category">${item.category}</span>
      </div>
      <div class="shop-item-desc">${item.desc}</div>
      <div class="shop-item-footer">
        <span class="shop-item-price">${item.price.toLocaleString()} CR</span>
        <button class="add-cart-btn">加入购物车</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const shopItem = e.target.closest('.shop-item');
      addToCart(shopItem.dataset.id, shopItem.dataset.name, parseInt(shopItem.dataset.price));
    });
  });
  renderCart();
}

const cart = [];

function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.count++;
  } else {
    cart.push({ id, name, price, count: 1 });
  }
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-list');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<div style="color:#666; font-size:11px; text-align:center;">购物车为空</div>';
    setVal('val-cart-total', '0 CR', 'val-gold');
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <span class="cart-item-name">${item.name}</span>
      <span class="cart-item-count">x${item.count}</span>
      <span class="cart-item-price">${(item.price * item.count).toLocaleString()} CR</span>
      <button class="remove-cart-btn" data-id="${item.id}">✕</button>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.count, 0);
  setVal('val-cart-total', `${total.toLocaleString()} CR`, 'val-gold');

  container.querySelectorAll('.remove-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = cart.findIndex(item => item.id === btn.dataset.id);
      if (index > -1) { cart.splice(index, 1); renderCart(); }
    });
  });
}

// 结算购物车
function checkout() {
  if (cart.length === 0) {
    showModal('购物车为空！');
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + item.price * item.count, 0);
  
  if (state.wallet < total) {
    showModal(`余额不足！<br>需要 ${total.toLocaleString()} CR<br>当前余额 ${state.wallet.toLocaleString()} CR`);
    return;
  }
  
  // 扣款
  updateWallet(-total);
  
  // 添加到待配送列表（1~3天随机配送时间）
  const userData = getUserData();
  if (!userData.pendingDelivery) {
    userData.pendingDelivery = [];
  }
  
  cart.forEach(cartItem => {
    const daysLeft = Math.floor(Math.random() * 3) + 1; // 1~3天
    const existingPending = userData.pendingDelivery.find(p => p.name === cartItem.name);
    if (existingPending) {
      existingPending.count += cartItem.count;
    } else {
      userData.pendingDelivery.push({
        id: 'pending_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: cartItem.name,
        count: cartItem.count,
        desc: '已购买物品',
        daysLeft: daysLeft,
        orderedAt: state.meta.currentDate
      });
    }
  });
  
  // 清空购物车
  cart.length = 0;
  
  // 刷新显示
  renderCart();
  renderInventory(userData.inventory);
  
  showModal(`购买成功！<br>消费 ${total.toLocaleString()} CR<br><br>📦 物品将在 1~3 天内配送到仓库`);
}

// 渲染基础数据
function renderBasicData(character) {
  const { basic } = character;
  if (!basic) return;
  setVal('val-bpm', basic.bpm, 'val-blue');
  setVal('val-temp', basic.temp);
  setVal('val-state', basic.state, 'val-blue');
}

// 渲染追踪数据
function renderTrackData(character) {
  const { track } = character;
  if (!track) return;
  setVal('val-zone', track.zone);
  setVal('val-zone-warn', track.warn);
  setVal('val-building', track.building);
  setVal('val-room', track.room);
  setVal('val-audio-text', track.audioText);
  setVal('val-audio-voice', track.audioVoice);
}

// 渲染生物指标
function renderMetrics(character) {
  const { metrics } = character;
  if (!metrics) return;

  // 性欲值
  const libidoLabel = getMetricLabel(metrics.libido);
  setVal('val-libido', `${metrics.libido}% (${libidoLabel})`, 'val-purple');
  updateBar('bar-libido', metrics.libido, 'bar-dev');

  // 压力值
  const stressLabel = getMetricLabel(metrics.stress);
  setVal('val-stress', `${metrics.stress}% (${stressLabel})`, 'val-gold');
  updateBar('bar-stress', metrics.stress, '');

  // 疲劳度
  const fatigueLabel = getMetricLabel(metrics.fatigue);
  setVal('val-fatigue', `${metrics.fatigue}% (${fatigueLabel})`, 'val-blue');
  updateBar('bar-fatigue', metrics.fatigue, 'bar-wet');

  // 堕落度
  if (metrics.corruption !== undefined) {
    const corruptionLabel = getCorruptionLabel(metrics.corruption);
    setVal('val-corruption', `${metrics.corruption}% (${corruptionLabel})`, 'val-purple');
    updateBar('bar-corruption', metrics.corruption, '');
  }
}

// 获取堕落度标签
function getCorruptionLabel(value) {
  if (value >= 80) return 'Fallen';
  if (value >= 60) return 'Corrupted';
  if (value >= 40) return 'Tainted';
  if (value >= 20) return 'Curious';
  if (value >= 10) return 'Innocent';
  return 'Pure';
}

// 获取指标标签
function getMetricLabel(value) {
  if (value > 80) return 'CRITICAL';
  if (value > 50) return 'High';
  if (value < 20) return 'Low';
  return 'Normal';
}

// 渲染心像数据
function renderMindData(character) {
  const { mind } = character;
  if (!mind) return;

  // 表层思维
  const surfaceContainer = document.getElementById('surface-thoughts');
  if (surfaceContainer) {
    surfaceContainer.innerHTML = mind.surface
      .map((t) => `<div class="thought-bubble">"${t}"</div>`)
      .join('');
  }

  // 深层思维
  const deepContainer = document.getElementById('deep-thoughts');
  if (deepContainer) {
    deepContainer.innerHTML = mind.deep
      .map((t) => `<div class="thought-bubble deep-thought">"${t}"</div>`)
      .join('');
  }

  // 情绪光谱
  setVal('val-shame', `${mind.shame}% (MAX)`, 'val-red');
  updateBar('bar-shame', mind.shame, '');
  setVal('val-pleasure', `${mind.pleasure}% (Rising)`, 'val-gold');
  updateBar('bar-pleasure', mind.pleasure, '');
}

// 渲染身体数据
function renderBodyData(character) {
  const { body } = character;
  if (!body) return;

  setVal('val-wet-level', body.wetLevel);
  updateBar('bar-wet', body.wetPercent, 'bar-wet');
  setVal('val-wet-note', '> ' + body.wetNote);

  setVal('val-semen-vol', body.semenVol, 'val-grey');
  setVal('val-semen-src', body.semenSrc, 'val-grey');
  setVal('val-anal-vol', body.analVol, 'val-grey');
  setVal('val-ejac-time', body.lastEjacTime);
  setVal('val-residue-note', '* 注：' + body.residueNote);
}

// 渲染敏感开发数据
function renderDevData(character) {
  const { dev } = character;
  if (!dev) return;

  // 上半身
  setVal('val-deep-throat', dev.upper.deepThroat.label, 'val-purple');
  updateBar('bar-deep-throat', dev.upper.deepThroat.level, 'bar-dev');
  setVal('val-nipple', dev.upper.nippleSensitivity.label, 'val-red');
  updateBar('bar-nipple', dev.upper.nippleSensitivity.level, 'bar-dev');
  setVal('val-lactation', dev.upper.lactationRisk, 'val-gold');

  // 下半身
  setVal('val-vaginal', dev.lower.vaginalCapacity.label, 'val-blue');
  updateBar('bar-vaginal', dev.lower.vaginalCapacity.level, 'bar-dev');
  setVal('val-anal-adapt', dev.lower.analAdaptation.label, 'val-grey');
  updateBar('bar-anal', dev.lower.analAdaptation.level, 'bar-dev');
  setVal('val-sphincter', dev.lower.sphincterState);
}

// 渲染统计数据
function renderStatsData(character) {
  const { stats } = character;
  if (!stats) return;

  setVal('val-kiss', `${stats.kiss.count} (Unknown: ${stats.kiss.unknown})`);
  setVal('val-paizuri', `${stats.paizuri.count} (Unknown: ${stats.paizuri.unknown})`);
  setVal('val-anal-count', `${stats.anal.count} (Unknown: ${stats.anal.unknown})`);
  setVal('val-sex', `${stats.sex.count} (Unknown: ${stats.sex.unknown})`);
  setVal('val-cheat', `${stats.cheat.count} (Unknown: ${stats.cheat.unknown})`);
  setVal('val-touch', `${stats.touch.count} (Unknown: ${stats.touch.unknown})`);
  setVal('val-oral', `${stats.oral.count} (${stats.oral.label})`, 'val-purple');
  setVal('val-orgasm', `${stats.orgasm.count} (Today: +${stats.orgasm.today})`, 'val-red');
}

// 渲染第一次记录
function renderFirstsData(character) {
  const { firsts } = character;
  if (!firsts) return;

  setVal('val-first-kiss', firsts.kiss, 'val-grey');
  setVal('val-virginity', firsts.virginity, 'val-gold');
  setVal('val-anal-v', firsts.analVirginity, 'val-gold');
  setVal('val-first-orgasm', firsts.firstOrgasm);
}

// 渲染最近接触对象
function renderRecentContacts(character) {
  const { recentContacts } = character;
  if (!recentContacts) return;
  
  const container = document.getElementById('recent-contacts');
  if (container) {
    container.innerHTML = recentContacts
      .map(
        (c) => `<div class="data-row"><span>${c.id}</span> <span class="data-value">${c.desc}</span></div>`
      )
      .join('');
  }
}

// 渲染穿搭数据
function renderOutfitData(character) {
  const { outfit } = character;
  if (!outfit) return;

  // 当前穿着
  setVal('val-outfit-top', outfit.current.top);
  setVal('val-outfit-inner', outfit.current.inner || '--');
  setVal('val-outfit-bottom', outfit.current.bottom);
  setVal('val-outfit-bra', outfit.current.bra, 'val-purple');
  setVal('val-outfit-panties', outfit.current.panties, 'val-purple');
  setVal('val-outfit-socks', outfit.current.socks);
  setVal('val-outfit-shoes', outfit.current.shoes);

  // 外观特征
  if (outfit.appearance) {
    setVal('val-appearance-hair', outfit.appearance.hair || '--');
    setVal('val-appearance-eyes', outfit.appearance.eyes || '--');
    setVal('val-appearance-expression', outfit.appearance.expression || '--');
    setVal('val-appearance-style', outfit.appearance.style || '--', 'val-purple');
  }

  // 内衣状态
  setVal('val-panty-wet', `${outfit.underwearStatus.wetness}%`, 'val-blue');
  updateBar('bar-panty-wet', outfit.underwearStatus.wetness, 'bar-wet');
  setVal('val-panty-stain', outfit.underwearStatus.stains);
  setVal('val-worn-time', outfit.underwearStatus.wornTime);

  // 配饰
  const accessoriesContainer = document.getElementById('accessories-list');
  if (accessoriesContainer) {
    accessoriesContainer.innerHTML = outfit.accessories
      .map(
        (a) => `<div class="data-row"><span>${a.name}</span> <span class="data-value">${a.desc}</span></div>`
      )
      .join('');
  }

  // 暴露度
  setVal('val-exposure', `${outfit.exposure.rating}% - ${outfit.exposure.label}`, 'val-gold');
  updateBar('bar-exposure', outfit.exposure.rating, '');
  setVal('val-seduction', `${outfit.exposure.seduction}%`, 'val-red');
}

// 渲染任务数据 (用户面板)
function renderTasksData() {
  const userData = getUserData();
  const { tasks } = userData;
  if (!tasks) return;

  // 主线任务
  const mainQuestContainer = document.getElementById('main-quest');
  if (mainQuestContainer) {
    mainQuestContainer.innerHTML = `
      <div class="data-row"><span>任务名称</span> <span class="data-value val-gold">${tasks.mainQuest.title}</span></div>
      <div class="data-row"><span>任务描述</span> <span class="data-value">${tasks.mainQuest.desc}</span></div>
      <div class="data-row"><span>进度</span> <span class="data-value val-blue">${tasks.mainQuest.progress}%</span></div>
      <div class="bar-container"><div class="bar-fill bar-wet" style="width: ${tasks.mainQuest.progress}%;" data-percent="${tasks.mainQuest.progress}%"></div></div>
      <div class="data-row" style="margin-top:5px;"><span>奖励</span> <span class="data-value val-purple">${tasks.mainQuest.reward}</span></div>
    `;
  }

  // 每日任务
  const dailyContainer = document.getElementById('daily-tasks');
  if (dailyContainer) {
    dailyContainer.innerHTML = tasks.daily
      .map((t) => {
        let statusClass = '';
        let statusIcon = '';
        if (t.status === 'completed') {
          statusClass = 'val-gold';
          statusIcon = '✅';
        } else if (t.status === 'active') {
          statusClass = 'val-blue';
          statusIcon = '🔄';
        } else {
          statusClass = 'val-grey';
          statusIcon = '🔒';
        }
        return `<div class="data-row"><span>${statusIcon} ${t.name}</span> <span class="data-value ${statusClass}">${t.reward}</span></div>`;
      })
      .join('');
  }

  // 隐藏任务
  const hiddenContainer = document.getElementById('hidden-tasks');
  if (hiddenContainer) {
    hiddenContainer.innerHTML = tasks.hidden
      .map(
        (t) => `
        <div class="data-row"><span>🔮 ${t.name}</span> <span class="data-value val-purple">${t.reward}</span></div>
        <div style="font-size:10px; color:#aaa; margin-bottom:8px; padding-left:20px;">提示: ${t.hint}</div>
      `
      )
      .join('');
  }

  // 任务统计
  setVal('val-completed', `${tasks.summary.completed} 个`, 'val-gold');
  setVal('val-earned-cr', `${tasks.summary.earnedCR} CR`);
  setVal('val-affection', tasks.summary.affectionChange, 'val-purple');
}

// 渲染 SNS 社交数据
function renderSNSData() {
  const userData = getUserData();
  const { sns } = userData;
  if (!sns) return;

  // 未读消息数
  const unreadBadge = document.getElementById('sns-unread');
  if (unreadBadge) {
    unreadBadge.textContent = sns.unreadCount || 0;
    unreadBadge.style.display = sns.unreadCount > 0 ? 'inline-block' : 'none';
  }

  // 联系人列表
  const contactList = document.getElementById('sns-contact-list');
  if (contactList && sns.contacts) {
    contactList.innerHTML = sns.contacts.map(contact => {
      const statusClass = contact.status === 'online' ? 'status-online' : 
                          contact.status === 'offline' ? 'status-offline' : 'status-unknown';
      const lastMsg = contact.messages[contact.messages.length - 1];
      return `
        <div class="sns-contact-item" data-contact-id="${contact.id}">
          <div class="sns-contact-avatar">${contact.avatar}</div>
          <div class="sns-contact-info">
            <div class="sns-contact-name">
              ${contact.name}
              <span class="sns-status-dot ${statusClass}"></span>
            </div>
            <div class="sns-contact-preview">${lastMsg ? lastMsg.text.substring(0, 20) + (lastMsg.text.length > 20 ? '...' : '') : '暂无消息'}</div>
          </div>
          <div class="sns-contact-time">${contact.lastSeen}</div>
        </div>
      `;
    }).join('');

    // 绑定点击事件
    contactList.querySelectorAll('.sns-contact-item').forEach(item => {
      item.addEventListener('click', () => {
        const contactId = item.dataset.contactId;
        showSNSChat(contactId);
        // 更新选中状态
        contactList.querySelectorAll('.sns-contact-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  // 渲染动态列表
  renderTimeline(sns.timeline);
  
  // 绑定 SNS 子 Tab 切换
  bindSNSTabEvents();
}

// 渲染动态列表
function renderTimeline(timeline) {
  const container = document.getElementById('sns-timeline-list');
  if (!container || !timeline) return;

  container.innerHTML = timeline.map(post => `
    <div class="timeline-post" data-post-id="${post.id}">
      <div class="post-header">
        <div class="post-avatar">${post.avatar}</div>
        <div class="post-author-info">
          <div class="post-author">${post.author}</div>
          <div class="post-time">${post.time}</div>
        </div>
      </div>
      <div class="post-content">${post.content}</div>
      <div class="post-actions">
        <span class="post-like">❤️ ${post.likes}</span>
        <span class="post-comment-count">💬 ${post.comments.length}</span>
      </div>
      ${post.comments.length > 0 ? `
        <div class="post-comments">
          ${post.comments.map(c => `
            <div class="comment-item">
              <span class="comment-author">${c.author}:</span>
              <span class="comment-text">${c.text}</span>
              <span class="comment-time">${c.time}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
}

// 绑定 SNS 子 Tab 切换事件
function bindSNSTabEvents() {
  document.querySelectorAll('.sns-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.snsTab;
      
      // 更新按钮状态
      document.querySelectorAll('.sns-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // 切换面板
      document.querySelectorAll('.sns-panel').forEach(panel => panel.classList.remove('active'));
      const targetPanel = document.getElementById(`sns-${tabId}-panel`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

// 显示 SNS 聊天记录
function showSNSChat(contactId) {
  const userData = getUserData();
  const { sns } = userData;
  if (!sns) return;

  const contact = sns.contacts.find(c => c.id === contactId);
  if (!contact) return;

  // 更新聊天标题
  const chatName = document.getElementById('sns-chat-name');
  if (chatName) {
    chatName.textContent = contact.name;
  }

  // 渲染聊天消息
  const chatMessages = document.getElementById('sns-chat-messages');
  if (chatMessages) {
    chatMessages.innerHTML = contact.messages.map(msg => {
      const isUser = msg.from === 'user';
      return `
        <div class="sns-message ${isUser ? 'sns-message-user' : 'sns-message-other'}">
          <div class="sns-message-bubble">${msg.text}</div>
          <div class="sns-message-time">${msg.time}</div>
        </div>
      `;
    }).join('');
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// 绑定事件
function bindEvents() {
  // Tab 切换 (角色面板)
  document.querySelectorAll('#character-tabs .tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Tab 切换 (用户面板)
  document.querySelectorAll('#user-tabs .tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // 用户面板按钮
  document.getElementById('user-panel-btn')?.addEventListener('click', () => {
    switchToUserPanel();
    switchPanelMode('user');
  });

  // 解锁按钮 (事件委托)
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('buy-btn')) {
      const lockId = e.target.dataset.lock;
      const cost = parseInt(e.target.dataset.cost, 10);
      if (lockId && cost) {
        unlockItem(lockId, cost);
      }
    }
  });

  // 弹窗关闭
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  
  // 结算按钮
  document.getElementById('checkout-btn')?.addEventListener('click', checkout);
}

// 导出到全局 (兼容内联事件)
window.switchTab = switchTab;
window.unlockItem = unlockItem;

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);
