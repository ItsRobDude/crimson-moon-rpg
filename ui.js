import { races } from './data/races.js';
import { classes, featureDefinitions } from './data/classes.js';
import { spells } from './data/spells.js';
import { gameState, initializeNewGame, equipItem, useConsumable, addItem, removeItem, syncPartyLevels } from './data/gameState.js';
import { items } from './data/items.js';
import { quests } from './data/quests.js';
import { locations } from './data/locations.js';
import { npcs } from './data/npcs.js';
import { factions } from './data/factions.js';
import { logMessage } from './logger.js';
import { getAbilityMod } from './rules.js';
import { goToScene, travelTo } from './exploration.js';

// --- Character Creation ---
let ccState = {
    baseStats: { STR: 12, DEX: 12, CON: 12, INT: 12, WIS: 12, CHA: 12 },
    chosenSkills: [],
    chosenSpells: []
};

export function showCharacterCreation() {
    const raceSelect = document.getElementById('cc-race');
    const classSelect = document.getElementById('cc-class');
    raceSelect.innerHTML = "";
    classSelect.innerHTML = "";
    for (const [key, race] of Object.entries(races)) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.innerText = race.name;
        raceSelect.appendChild(opt);
    }
    for (const [key, cls] of Object.entries(classes)) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.innerText = cls.name;
        classSelect.appendChild(opt);
    }
    renderAbilityScoreUI();
    raceSelect.onchange = updateCCPreview;
    classSelect.onchange = () => {
        ccState.chosenSkills = [];
        ccState.chosenSpells = [];
        updateCCPreview();
    };
    updateCCPreview();
    document.getElementById('char-creation-modal').classList.remove('hidden');
}

function renderAbilityScoreUI() {
    const container = document.getElementById('cc-abilities-container');
    container.innerHTML = '';
    const standardArray = [15, 14, 13, 12, 10, 8];
    const stats = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    // Reset defaults only if first load? No, reset here.
    ccState.baseStats = { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 };

    stats.forEach((stat, index) => {
        const row = document.createElement('div');
        row.className = 'stat-row';
        const label = document.createElement('label');
        label.innerText = stat;
        const select = document.createElement('select');
        standardArray.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.innerText = val;
            if (val === standardArray[index]) opt.selected = true;
            select.appendChild(opt);
        });
        select.onchange = (e) => {
            ccState.baseStats[stat] = parseInt(e.target.value);
            updateCCPreview();
        };
        row.appendChild(label);
        row.appendChild(select);
        container.appendChild(row);
    });
}

function updateCCPreview() {
    const raceKey = document.getElementById('cc-race').value;
    const classKey = document.getElementById('cc-class').value;
    const race = races[raceKey];
    const cls = classes[classKey];
    document.getElementById('cc-race-desc').innerText = race.description;
    document.getElementById('cc-class-desc').innerText = cls.description;
    const finalStats = { ...ccState.baseStats };
    if (race.abilityBonuses) {
        for (const [stat, bonus] of Object.entries(race.abilityBonuses)) {
            if (finalStats[stat]) finalStats[stat] += bonus;
        }
    }
    renderSkillChoices(cls);
    renderSpellChoices(cls);
    const preview = document.getElementById('cc-preview-content');
    preview.innerHTML = '';
    Object.entries(finalStats).forEach(([stat, val]) => {
        const mod = getAbilityMod(val);
        const div = document.createElement('div');
        div.className = 'preview-stat';
        div.innerHTML = `<span>${stat}</span> <span>${val} (${mod >= 0 ? '+' : ''}${mod})</span>`;
        preview.appendChild(div);
    });
    const hp = cls.hitDie + getAbilityMod(finalStats.CON);
    let ac = 10 + getAbilityMod(finalStats.DEX);
    if (classKey === 'fighter') ac = 16;
    if (classKey === 'rogue') ac = 11 + getAbilityMod(finalStats.DEX);
    preview.innerHTML += `<div class="preview-stat highlight"><span>HP</span> <span>${hp}</span></div>`;
    preview.innerHTML += `<div class="preview-stat"><span>AC</span> <span>${ac}</span></div>`;
    if (ccState.chosenSkills.length > 0) {
        preview.innerHTML += `<div class="preview-stat highlight"><span>Skills</span></div>`;
        ccState.chosenSkills.forEach(s => {
             preview.innerHTML += `<div class="preview-stat" style="padding-left:10px; font-size:0.8em;">${s}</div>`;
        });
    }
    if (ccState.chosenSpells.length > 0) {
        preview.innerHTML += `<div class="preview-stat highlight"><span>Spells</span></div>`;
        ccState.chosenSpells.forEach(s => {
             const spellName = spells[s] ? spells[s].name : s;
             preview.innerHTML += `<div class="preview-stat" style="padding-left:10px; font-size:0.8em;">${spellName}</div>`;
        });
    }
}

function renderSkillChoices(cls) {
    const container = document.getElementById('cc-skills-container');
    const currentSkills = ccState.chosenSkills;
    container.innerHTML = '';
    const max = 2;
    document.getElementById('cc-skill-count').innerText = max;
    // Use skillProficiencies as fixed previously
    cls.skillProficiencies.forEach(skill => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = skill;
        if (currentSkills.includes(skill)) input.checked = true;
        input.onchange = (e) => {
            if (e.target.checked) {
                if (ccState.chosenSkills.length < max) {
                    ccState.chosenSkills.push(skill);
                } else {
                    e.target.checked = false;
                }
            } else {
                ccState.chosenSkills = ccState.chosenSkills.filter(s => s !== skill);
            }
            updateCCPreview();
        };
        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + skill.charAt(0).toUpperCase() + skill.slice(1)));
        div.appendChild(label);
        container.appendChild(div);
    });
}

function renderSpellChoices(cls) {
    const section = document.getElementById('cc-spells-section');
    const container = document.getElementById('cc-spells-container');
    container.innerHTML = '';
    let availableSpells = [];
    if (document.getElementById('cc-class').value === 'wizard') {
        availableSpells = ['firebolt', 'magic_missile', 'burning_hands', 'cure_wounds'];
    } else if (document.getElementById('cc-class').value === 'cleric') {
        availableSpells = ['cure_wounds'];
    }
    if (availableSpells.length === 0) {
        section.classList.add('hidden');
        ccState.chosenSpells = [];
        return;
    }
    section.classList.remove('hidden');
    const max = 2;
    availableSpells.forEach(spellId => {
        const spell = spells[spellId];
        if (!spell) return;
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = spellId;
        if (ccState.chosenSpells.includes(spellId)) input.checked = true;
        input.onchange = (e) => {
            if (e.target.checked) {
                if (ccState.chosenSpells.length < max) {
                    ccState.chosenSpells.push(spellId);
                } else {
                    e.target.checked = false;
                }
            } else {
                ccState.chosenSpells = ccState.chosenSpells.filter(s => s !== spellId);
            }
            updateCCPreview();
        };
        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${spell.name}`));
        div.appendChild(label);
        container.appendChild(div);
    });
}

export function finishCharacterCreation() {
    const name = document.getElementById('cc-name').value || "Traveler";
    const raceKey = document.getElementById('cc-race').value;
    const classKey = document.getElementById('cc-class').value;

    const stats = Object.values(ccState.baseStats);
    const uniqueStats = new Set(stats);
    if (uniqueStats.size !== stats.length) {
        alert("Please assign each Standard Array value (15, 14, 13, 12, 10, 8) exactly once.");
        return;
    }

    if (ccState.chosenSkills.length === 0) {
        alert("Please choose your skills.");
        return;
    }
    const isCaster = (classKey === 'wizard' || classKey === 'cleric');
    if (isCaster && ccState.chosenSpells.length === 0) {
        alert("Please choose your starting spells.");
        return;
    }
    initializeNewGame(name, raceKey, classKey, ccState.baseStats, ccState.chosenSkills, ccState.chosenSpells);
    document.getElementById('char-creation-modal').classList.add('hidden');
    updateStatsUI();
    goToScene(gameState.currentSceneId);
    logMessage(`Character ${name} created. Welcome to Silverthorn.`, "system");
}

// --- HUD / Menus ---

export function updateStatsUI() {
    const p = gameState.player;
    document.getElementById('char-name').innerText = p.name;
    document.getElementById('char-class').innerText = p.classId ? classes[p.classId].name : "Class";

    const levelEl = document.getElementById('char-level');
    if (gameState.pendingLevelUp) {
        levelEl.innerText = `Lvl ${p.level} (UP!)`;
        levelEl.style.color = 'gold';
        levelEl.style.cursor = 'pointer';
        levelEl.classList.add('pulse-animation');
    } else {
        levelEl.innerText = `Lvl ${p.level}`;
        levelEl.style.color = '';
        levelEl.style.cursor = 'default';
        levelEl.classList.remove('pulse-animation');
    }

    document.getElementById('char-ac').innerText = `AC ${getPlayerAC()}`;

    const weapon = p.equipped.weapon ? items[p.equipped.weapon] : null;
    const armor = p.equipped.armor ? items[p.equipped.armor] : null;
    const weaponDetail = weapon ? `${weapon.damage} ${weapon.modifier ? `(${weapon.modifier})` : ''}`.trim() : '1d2 (STR)';
    const armorDetail = armor ? `${armor.armorType || 'armor'} AC ${armor.acBase}` : 'base 10 + DEX';
    document.getElementById('char-weapon').innerText = `Weapon: ${weapon ? weapon.name : 'Unarmed'} · ${weaponDetail}`;
    document.getElementById('char-armor').innerText = `Armor: ${armor ? armor.name : 'None'} · ${armorDetail}`;

    const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
    document.getElementById('hp-bar-fill').style.width = `${hpPct}%`;
    document.getElementById('hp-text').innerText = `HP: ${p.hp}/${p.maxHp}`;

    const xpPct = Math.max(0, (p.xp / p.xpNext) * 100);
    document.getElementById('xp-bar-fill').style.width = `${xpPct}%`;
    document.getElementById('xp-text').innerText = `XP: ${p.xp}/${p.xpNext}`;
}

function getPlayerAC() {
    const p = gameState.player;
    const armor = p.equippedArmorId ? items[p.equippedArmorId] : null;
    if (armor) return armor.acBase;
    if (p.classId === 'fighter') return 10 + p.modifiers.DEX;
    return 10 + p.modifiers.DEX;
}

export function toggleInventory(forceOpen = null, characterId = 'player') {
    const modal = document.getElementById('inventory-modal');
    const list = document.getElementById('inventory-list');
    const charSelect = document.getElementById('inventory-character-select');

    if (forceOpen === false || (forceOpen === null && !modal.classList.contains('hidden'))) {
        modal.classList.add('hidden');
        return;
    }

    modal.classList.remove('hidden');
    list.innerHTML = '';
    charSelect.innerHTML = '';

    // Render Tabs
    const chars = ['player', ...gameState.party];
    chars.forEach(id => {
        const btn = document.createElement('button');
        const name = (id === 'player') ? gameState.player.name : gameState.roster[id].name;
        btn.innerText = name;
        btn.className = (id === characterId) ? 'tab-active' : '';
        btn.onclick = () => toggleInventory(true, id);
        charSelect.appendChild(btn);
    });

    const targetChar = (characterId === 'player') ? gameState.player : gameState.roster[characterId];
    if (!targetChar || targetChar.inventory.length === 0) {
        list.innerHTML = '<p>Empty.</p>';
        return;
    }

    targetChar.inventory.forEach(itemId => {
        const item = items[itemId];
        if (!item) return;

        const row = document.createElement('div');
        row.className = 'inventory-item';
        row.innerHTML = `<strong>${item.name}</strong> <small>${item.type}</small>`;

        const actions = document.createElement('div');

        if (item.type === 'weapon' || item.type === 'armor') {
            const equipBtn = document.createElement('button');
            let isEquipped = false;
            if (characterId === 'player') {
                isEquipped = (gameState.player.equipped.weapon === itemId || gameState.player.equipped.armor === itemId);
            } else {
                isEquipped = (targetChar.equipped.weapon === itemId || targetChar.equipped.armor === itemId);
            }

            equipBtn.innerText = isEquipped ? "Equipped" : "Equip";
            equipBtn.disabled = isEquipped;
            equipBtn.onclick = () => {
                const res = equipItem(itemId, characterId);
                if (res.success) {
                    logMessage(`Equipped ${item.name}.`, "system");
                    toggleInventory(true, characterId);
                    updateStatsUI();
                } else {
                    logMessage(`Cannot equip: ${res.reason}`, "check-fail");
                }
            };
            actions.appendChild(equipBtn);
        }

        // Transfer Button
        const transferBtn = document.createElement('button');
        transferBtn.innerText = "Give";
        transferBtn.onclick = () => {
            // Simple cycle: Give to next char
            let targetId = 'player';
            if (characterId === 'player') {
                if (gameState.party.length > 0) targetId = gameState.party[0];
                else { logMessage("No one to give to.", "system"); return; }
            }

            removeItem(itemId, characterId);
            addItem(itemId, targetId);
            logMessage(`Transferred ${item.name}.`, "system");
            toggleInventory(true, characterId);
        };
        actions.appendChild(transferBtn);

        row.appendChild(actions);
        list.appendChild(row);
    });
}

export function toggleQuestLog() {
    const modal = document.getElementById('quest-modal');
    const list = document.getElementById('quest-list');

    if (!modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        return;
    }

    modal.classList.remove('hidden');
    list.innerHTML = '';

    for (const [qid, qData] of Object.entries(gameState.quests)) {
        if (qData.currentStage > 0) {
            const div = document.createElement('div');
            div.className = 'quest-entry';
            div.innerHTML = `<h4>${qData.title}</h4><p>${qData.stages[qData.currentStage]}</p>`;
            if (qData.completed) div.innerHTML += ` <span style='color:gold'>(Completed)</span>`;
            list.appendChild(div);
        }
    }

    if (list.innerHTML === '') list.innerHTML = '<p>No active quests.</p>';
}

export function toggleMenu() {
    const modal = document.getElementById('menu-modal');
    modal.classList.toggle('hidden');
}

export function showRestModal() {
    const modal = document.getElementById('rest-modal');
    const warning = document.getElementById('long-rest-warning');
    const shortRestBtn = document.getElementById('btn-short-rest');
    const longRestBtn = document.getElementById('btn-long-rest');

    if (gameState.threat.level > 50) {
        warning.innerText = "Resting here is dangerous. There is a high chance of being ambushed.";
    } else if (gameState.threat.level > 20) {
        warning.innerText = "The area is unsafe. Resting might attract unwanted attention.";
    } else {
        warning.innerText = "";
    }

    shortRestBtn.onclick = () => {
        modal.classList.add('hidden');
        logMessage("You take a short rest.", "system");
        performShortRest();
        updateStatsUI();
    };

    longRestBtn.onclick = () => {
        modal.classList.add('hidden');
        if (gameState.threat.level > 20 && Math.random() * 100 <= gameState.threat.level) {
            logMessage("You are ambushed while resting!", "combat");
            if (window.startCombat) {
                window.startCombat(['fungal_beast'], gameState.currentSceneId, 'SCENE_DEFEAT');
            } else {
                console.error("startCombat is not available on window.");
            }
        } else {
            logMessage("You take a long rest.", "system");
            performLongRest();
            updateStatsUI();
        }
    };

    modal.classList.remove('hidden');
}

function performLongRest() {
    gameState.player.hp = gameState.player.maxHp;
    if (gameState.player.spellSlots) {
        gameState.player.currentSlots = { ...gameState.player.spellSlots };
    }
    if (gameState.player.resources['second_wind']) {
        gameState.player.resources['second_wind'].current = gameState.player.resources['second_wind'].max;
    }
    if (gameState.player.resources['action_surge']) {
        gameState.player.resources['action_surge'].current = gameState.player.resources['action_surge'].max;
    }
    // Restore party
    gameState.party.forEach(id => {
        const char = gameState.roster[id];
        char.hp = char.maxHp;
        if (char.spellSlots) char.currentSlots = { ...char.spellSlots };
        if (char.resources['second_wind']) char.resources['second_wind'].current = char.resources['second_wind'].max;
        if (char.resources['action_surge']) char.resources['action_surge'].current = char.resources['action_surge'].max;
    });
    return true;
}

function performShortRest() {
    // Heal 1 HD for everyone
    [gameState.player, ...gameState.party.map(id => gameState.roster[id])].forEach(char => {
        const cls = classes[char.classId];
        const roll = Math.floor(Math.random() * cls.hitDie) + 1 + (char.modifiers.CON || 0);
        const healed = Math.max(1, roll);
        char.hp = Math.min(char.maxHp, char.hp + healed);

        if (char.resources['second_wind']) char.resources['second_wind'].current = char.resources['second_wind'].max;
        if (char.resources['action_surge']) char.resources['action_surge'].current = char.resources['action_surge'].max;
    });

    return true;
}

// --- Codex & Map ---

export function toggleMap() {
    const modal = document.getElementById('map-modal');
    const list = document.getElementById('map-locations');
    const pinList = document.getElementById('pin-list');
    const addBtn = document.getElementById('btn-add-pin');
    const pinNote = document.getElementById('pin-note');
    list.innerHTML = '';
    pinList.innerHTML = '';

    for (const [key, loc] of Object.entries(locations)) {
        if (isLocationDiscovered(key)) {
            const div = document.createElement('div');
            div.style.padding = "10px";
            div.style.borderBottom = "1px solid #444";
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.style.alignItems = "center";

            const info = document.createElement('div');
            info.innerHTML = `<strong>${loc.name}</strong><br><small>${loc.description}</small>`;

            const btn = document.createElement('button');
            btn.innerText = "Travel";
            btn.onclick = () => travelTo(key);

            if (scenes[gameState.currentSceneId] && scenes[gameState.currentSceneId].location === key) {
                btn.disabled = true;
                btn.innerText = "You are here";
            }

            div.appendChild(info);
            div.appendChild(btn);
            list.appendChild(div);
        }
    }

    gameState.mapPins.forEach((pin, idx) => {
        const row = document.createElement('div');
        row.className = 'pin-row';
        row.innerHTML = `<strong>${locations[pin.locationId]?.name || pin.locationId}</strong>: ${pin.note || 'marked route'}`;
        const rm = document.createElement('button');
        rm.innerText = 'Remove';
        rm.onclick = () => {
            removeMapPin(idx);
            toggleMap();
        };
        row.appendChild(rm);
        pinList.appendChild(row);
    });

    const mapContainer = document.getElementById('map-container');
    mapContainer.onclick = (e) => {
        const note = prompt("Enter a note for this pin:", "Marked location");
        if (note) {
            const currentLocation = scenes[gameState.currentSceneId]?.location || 'travel';
            addMapPin(currentLocation, note);
            toggleMap();
        }
    };

    addBtn.onclick = () => {
        const currentLocation = scenes[gameState.currentSceneId]?.location || 'travel';
        addMapPin(currentLocation, pinNote.value);
        pinNote.value = '';
        toggleMap();
    };

    modal.classList.remove('hidden');
}

export function toggleCodex(tab = 'people') {
    const modal = document.getElementById('codex-modal');
    const list = document.getElementById('codex-list');
    const btnPeople = document.getElementById('btn-codex-people');
    const btnFactions = document.getElementById('btn-codex-factions');

    modal.classList.remove('hidden');
    list.innerHTML = '';

    if (tab === 'people') {
        btnPeople.classList.add('tab-active');
        btnFactions.classList.remove('tab-active');
        renderCodexPeople(list);
    } else {
        btnPeople.classList.remove('tab-active');
        btnFactions.classList.add('tab-active');
        renderCodexFactions(list);
    }
}

function renderCodexPeople(container) {
    const metNpcs = Object.keys(gameState.relationships);
    if (metNpcs.length === 0) {
        container.innerHTML = "<p style='padding:10px'>No known contacts.</p>";
        return;
    }

    metNpcs.forEach(npcId => {
        const npc = npcs[npcId];
        const score = getRelationship(npcId);
        if (!npc) return;

        const div = document.createElement('div');
        div.className = "codex-entry";

        let label = "Neutral";
        if (score >= 30) label = "Warm";
        if (score >= 70) label = "Ally";
        if (score <= -30) label = "Cold";
        if (score <= -70) label = "Hostile";

        const pct = ((score + 100) / 200) * 100;

        div.innerHTML = `
            <h4>${npc.name}</h4>
            <p>${npc.description}</p>
            <div class="codex-label">${label} (${score})</div>
            <div class="codex-bar-container">
                <div class="codex-bar-fill" style="width: ${pct}%"></div>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderCodexFactions(container) {
    Object.keys(gameState.reputation).forEach(factId => {
        const fact = factions[factId];
        const score = getReputation(factId);
        if (!fact) return;

        const div = document.createElement('div');
        div.className = "codex-entry";

        let label = "Neutral";
        if (score >= 30) label = "Respected";
        if (score >= 70) label = "Hero";
        if (score <= -30) label = "Uneasy";
        if (score <= -70) label = "Enemy";

        const pct = ((score + 100) / 200) * 100;

        div.innerHTML = `
            <h4>${fact.name}</h4>
            <p>${fact.description}</p>
            <div class="codex-label">${label} (${score})</div>
            <div class="codex-bar-container">
                <div class="codex-bar-fill" style="width: ${pct}%"></div>
            </div>
        `;
        container.appendChild(div);
    });
}

export function showLevelUpModal() {
    const modal = document.getElementById('level-up-modal');
    const levelEl = document.getElementById('lu-level');
    const hpEl = document.getElementById('lu-hp-gain');
    const featuresList = document.getElementById('lu-features-list');
    const subclassSection = document.getElementById('lu-subclass-section');
    const featSection = document.getElementById('lu-feat-section');
    const confirmBtn = document.getElementById('btn-confirm-level-up');

    const nextLevel = gameState.player.level + 1;
    levelEl.innerText = nextLevel;

    const cls = classes[gameState.player.classId];
    const hpGain = Math.floor(cls.hitDie / 2) + 1 + gameState.player.modifiers.CON;
    hpEl.innerText = hpGain;

    const levelData = cls.progression[nextLevel];
    featuresList.innerHTML = '';
    if (levelData && levelData.features) {
        levelData.features.forEach(featKey => {
            const featDef = featureDefinitions[featKey] || { name: featKey, description: "" };
            const li = document.createElement('li');
            li.innerHTML = `<strong>${featDef.name}</strong>: ${featDef.description}`;
            featuresList.appendChild(li);
        });
    }

    subclassSection.classList.add('hidden');
    let selectedSubclass = null;
    if (nextLevel === 3 && cls.subclasses) {
        subclassSection.classList.remove('hidden');
        const optionsDiv = document.getElementById('lu-subclass-options');
        optionsDiv.innerHTML = '';

        Object.entries(cls.subclasses).forEach(([key, sub]) => {
            const div = document.createElement('div');
            div.className = 'subclass-option';
            div.style.padding = '5px';
            div.style.border = '1px solid #555';
            div.style.margin = '5px 0';
            div.style.cursor = 'pointer';

            div.innerHTML = `<strong>${sub.name}</strong><p><small>${sub.description}</small></p>`;
            div.onclick = () => {
                document.querySelectorAll('.subclass-option').forEach(d => d.style.borderColor = '#555');
                div.style.borderColor = 'gold';
                selectedSubclass = key;
            };
            optionsDiv.appendChild(div);
        });
    }

    featSection.classList.add('hidden');
    if (nextLevel % 4 === 0) {
        featSection.classList.remove('hidden');
        const stats = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
        ['asi-stat-1', 'asi-stat-2'].forEach(id => {
            const sel = document.getElementById(id);
            sel.innerHTML = '';
            stats.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.innerText = s;
                sel.appendChild(opt);
            });
        });
    }

    modal.classList.remove('hidden');

    confirmBtn.onclick = () => {
        if (nextLevel === 3 && cls.subclasses && !selectedSubclass) {
            alert("You must choose a subclass.");
            return;
        }

        gameState.player.level = nextLevel;
        gameState.player.xpNext = nextLevel * 300;
        gameState.player.maxHp += hpGain;
        gameState.player.hp += hpGain;

        if (levelData.proficiencyBonus) gameState.player.proficiencyBonus = levelData.proficiencyBonus;

        if (selectedSubclass) {
            gameState.player.subclassId = selectedSubclass;
            logMessage(`You have chosen the path of the ${cls.subclasses[selectedSubclass].name}.`, "gain");
        }

        if (nextLevel % 4 === 0) {
            const s1 = document.getElementById('asi-stat-1').value;
            const s2 = document.getElementById('asi-stat-2').value;
            gameState.player.abilities[s1]++;
            gameState.player.abilities[s2]++;
            gameState.player.modifiers[s1] = getAbilityMod(gameState.player.abilities[s1]);
            gameState.player.modifiers[s2] = getAbilityMod(gameState.player.abilities[s2]);
            logMessage(`Increased ${s1} and ${s2} by 1.`, "gain");
        }

        if (levelData.features) {
            levelData.features.forEach(f => {
                if (f === 'action_surge') gameState.player.resources['action_surge'] = { current: 1, max: 1 };
            });
        }

        if (levelData.spellSlots) {
             gameState.player.spellSlots = { ...levelData.spellSlots };
             gameState.player.currentSlots = { ...levelData.spellSlots };
        }

        gameState.pendingLevelUp = false;
        modal.classList.add('hidden');
        logMessage(`You are now Level ${nextLevel}!`, "gain");
        updateStatsUI();

        syncPartyLevels();
    };
}

export function saveGame() {
    localStorage.setItem('crimson_moon_save', JSON.stringify(gameState));
    logMessage("Game Saved.", "system");
}

export function loadGame() {
    const data = localStorage.getItem('crimson_moon_save');
    if (data) {
        Object.assign(gameState, JSON.parse(data));
        logMessage("Game Loaded.", "system");
        updateStatsUI();
        goToScene(gameState.currentSceneId);
    } else {
        logMessage("No save found.", "check-fail");
    }
}

export function initUI() {
    // This function will be called from game.js to set up listeners
    const btnNew = document.getElementById('btn-new-game');
    if (btnNew) btnNew.onclick = showCharacterCreation;

    const btnLoad = document.getElementById('btn-load-game');
    if (btnLoad) btnLoad.onclick = loadGame;

    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) btnSettings.onclick = () => alert("Settings not implemented.");

    // Inventory close
    const btnCloseInv = document.getElementById('btn-close-inventory');
    if (btnCloseInv) btnCloseInv.onclick = () => toggleInventory(false);

    // Map close
    const btnCloseMap = document.getElementById('btn-close-map');
    if (btnCloseMap) btnCloseMap.onclick = toggleMap;

    // Quest close
    const btnCloseQuest = document.getElementById('btn-close-quest');
    if (btnCloseQuest) btnCloseQuest.onclick = toggleQuestLog;

    // Menu close
    const btnCloseMenu = document.getElementById('btn-close-menu');
    if (btnCloseMenu) btnCloseMenu.onclick = toggleMenu;

    // Codex close
    const btnCloseCodex = document.getElementById('btn-close-codex');
    if (btnCloseCodex) btnCloseCodex.onclick = () => document.getElementById('codex-modal').classList.add('hidden');

    // Expose UI functions to window for other modules to use without circular imports
    window.toggleInventory = toggleInventory;
    window.toggleMap = toggleMap;
    window.toggleQuestLog = toggleQuestLog;
    window.toggleMenu = toggleMenu;
    window.toggleCodex = toggleCodex;
    window.showRestModal = showRestModal;
    window.updateStatsUI = updateStatsUI;
    window.saveGame = saveGame;
    window.loadGame = loadGame;
    window.showCharacterCreation = showCharacterCreation;
    window.showLevelUpModal = showLevelUpModal;
}
