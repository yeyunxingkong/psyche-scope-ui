// 应用状态管理
import gameDataJson from '../data/gameData.json';

export const state = {
  wallet: gameDataJson.meta.wallet,
  meta: gameDataJson.meta,
  characters: gameDataJson.characters,
  user: gameDataJson.user,
  currentCharacterId: gameDataJson.characters[0]?.id || null,
  currentMode: 'character', // 'character' | 'user'
  unlockedItems: new Set()
};

// 获取当前选中的角色数据
export function getCurrentCharacter() {
  return state.characters.find(c => c.id === state.currentCharacterId) || null;
}

// 切换当前角色
export function setCurrentCharacter(characterId) {
  const character = state.characters.find(c => c.id === characterId);
  if (character) {
    state.currentCharacterId = characterId;
    state.currentMode = 'character';
    return true;
  }
  return false;
}

// 切换到用户面板
export function switchToUserPanel() {
  state.currentMode = 'user';
}

// 切换到角色面板
export function switchToCharacterPanel() {
  state.currentMode = 'character';
}

// 获取当前模式
export function getCurrentMode() {
  return state.currentMode;
}

// 添加新角色
export function addCharacter(characterData) {
  if (!characterData.id) {
    characterData.id = 'CHAR_' + Date.now();
  }
  state.characters.push(characterData);
  return characterData.id;
}

// 移除角色
export function removeCharacter(characterId) {
  const index = state.characters.findIndex(c => c.id === characterId);
  if (index > -1) {
    state.characters.splice(index, 1);
    // 如果删除的是当前角色，切换到第一个角色
    if (state.currentCharacterId === characterId) {
      state.currentCharacterId = state.characters[0]?.id || null;
    }
    return true;
  }
  return false;
}

// 获取所有角色
export function getAllCharacters() {
  return state.characters;
}

// 获取用户数据
export function getUserData() {
  return state.user;
}

// 更新钱包
export function updateWallet(amount) {
  state.wallet += amount;
  const walletEl = document.getElementById('walletDisplay');
  if (walletEl) {
    walletEl.textContent = state.wallet.toLocaleString();
  }
}

// 检查是否已解锁
export function isUnlocked(lockId) {
  return state.unlockedItems.has(lockId);
}

// 标记为已解锁
export function markUnlocked(lockId) {
  state.unlockedItems.add(lockId);
}
