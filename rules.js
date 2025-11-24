export function rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

export function rollDiceExpression(expr) {
    const regex = /(\d+)d(\d+)([+-]\d+)?/;
    const match = expr.match(regex);

    if (!match) {
        console.error("Invalid dice expression:", expr);
        return { total: 0, rolls: [], detail: "Error" };
    }

    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    let total = 0;
    let rolls = [];

    for (let i = 0; i < count; i++) {
        const r = rollDie(sides);
        rolls.push(r);
        total += r;
    }

    total += modifier;

    const detail = `[${rolls.join('+')}]${modifier !== 0 ? (modifier > 0 ? '+' + modifier : modifier) : ''}`;

    return { total, rolls, detail, modifier };
}

export function getCritDamageExpression(expr) {
    const regex = /(\d+)d(\d+)([+-]\d+)?/;
    const match = expr.match(regex);

    if (!match) return expr; // Fallback

    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] ? match[3] : ""; // Keep modifier string "+2"

    // Double the dice count
    return `${count * 2}d${sides}${modifier}`;
}

export function getAbilityMod(score) {
    return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level) {
    return Math.ceil(1 + (level / 4));
}

export function getSkillBonus(gameState, skillName) {
    const skillMap = {
        perception: "WIS",
        investigation: "INT",
        athletics: "STR",
        stealth: "DEX",
        arcana: "INT",
        religion: "INT",
        persuasion: "CHA",
        intimidation: "CHA",
        medicine: "WIS",
        survival: "WIS",
        insight: "WIS",
        acrobatics: "DEX",
        history: "INT",
        nature: "INT"
    };

    const ability = skillMap[skillName.toLowerCase()] || "DEX"; // Default
    const score = gameState.player.abilities[ability];
    let bonus = getAbilityMod(score);

    if (gameState.player.skills.includes(skillName)) {
        bonus += gameState.player.proficiencyBonus;
    }

    return { bonus, ability };
}

function hasStatus(gameState, effectId) {
    return gameState.player.statusEffects && gameState.player.statusEffects.some(e => e.id === effectId);
}

export function rollSkillCheck(gameState, skillName) {
    const { bonus } = getSkillBonus(gameState, skillName);

    const isPoisoned = hasStatus(gameState, 'poisoned');
    const isBlessed = hasStatus(gameState, 'blessed');

    let roll1 = rollDie(20);
    let roll2 = rollDie(20);

    let finalRoll = roll1;
    let note = "";

    if (isPoisoned) {
        finalRoll = Math.min(roll1, roll2);
        note += " (Disadvantage/Poisoned)";
    }

    let total = finalRoll + bonus;

    if (isBlessed) {
        const blessDie = rollDie(4);
        total += blessDie;
        note += ` + ${blessDie} (Bless)`;
    }

    return {
        total,
        roll: finalRoll,
        modifier: bonus,
        note: note
    };
}

export function rollSavingThrow(gameState, abilityName) {
    const score = gameState.player.abilities[abilityName];
    let bonus = getAbilityMod(score);

    const isBlessed = hasStatus(gameState, 'blessed');

    let roll = rollDie(20);
    let total = roll + bonus;
    let note = "";

    if (isBlessed) {
        const blessDie = rollDie(4);
        total += blessDie;
        note += ` + ${blessDie} (Bless)`;
    }

    return {
        total,
        roll: roll,
        modifier: bonus,
        note: note
    };
}

export function rollAttack(gameState, modStat, proficiency) {
    const score = gameState.player.abilities[modStat];
    const mod = getAbilityMod(score);
    const totalMod = mod + proficiency;

    const isPoisoned = hasStatus(gameState, 'poisoned');
    const isBlessed = hasStatus(gameState, 'blessed');

    let roll1 = rollDie(20);
    let roll2 = rollDie(20);

    let finalRoll = roll1;
    let note = "";

    if (isPoisoned) {
        finalRoll = Math.min(roll1, roll2);
        note += " (Disadvantage)";
    }

    let total = finalRoll + totalMod;

    if (isBlessed) {
        const blessDie = rollDie(4);
        total += blessDie;
        note += ` + ${blessDie} (Bless)`;
    }

    return {
        total,
        roll: finalRoll,
        modifier: totalMod,
        note,
        isCritical: (finalRoll === 20)
    };
}

export function rollInitiative(gameState, entityType, bonus = 0) {
    let roll = rollDie(20);
    let modifier = bonus;

    if (entityType === 'player') {
        // DEX check essentially
        modifier = getAbilityMod(gameState.player.abilities.DEX);
    }

    return {
        total: roll + modifier,
        roll: roll,
        modifier: modifier
    };
}
