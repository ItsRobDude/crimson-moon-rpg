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

export function rollSkillCheck(gameState, skillName, advantage = false) {
    const { bonus } = getSkillBonus(gameState, skillName);

    const isPoisoned = hasStatus(gameState, 'poisoned');
    const isBlessed = hasStatus(gameState, 'blessed');
    const hasSporeSickness = hasStatus(gameState, 'spore_sickness');

    let roll1 = rollDie(20);
    let roll2 = rollDie(20);

    let finalRoll = roll1;
    let note = "";

    const hasDisadvantage = isPoisoned || (hasSporeSickness && skillName === 'constitution'); // Example logic

    if (advantage && !hasDisadvantage) {
        finalRoll = Math.max(roll1, roll2);
        note += " (Advantage)";
    } else if (hasDisadvantage && !advantage) {
        finalRoll = Math.min(roll1, roll2);
        note += " (Disadvantage)";
    } else if (advantage && hasDisadvantage) {
        // Cancel out
        finalRoll = roll1;
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

export function rollAttack(gameState, modStat, proficiency, advantage = false) {
    const score = gameState.player.abilities[modStat];
    const mod = getAbilityMod(score);
    const totalMod = mod + proficiency;

    const isPoisoned = hasStatus(gameState, 'poisoned');
    const isBlessed = hasStatus(gameState, 'blessed');

    let roll1 = rollDie(20);
    let roll2 = rollDie(20);

    let finalRoll = roll1;
    let note = "";

    const hasDisadvantage = isPoisoned; // Add more conditions if needed

    if (advantage && !hasDisadvantage) {
        finalRoll = Math.max(roll1, roll2);
        note += " (Advantage)";
    } else if (hasDisadvantage && !advantage) {
        finalRoll = Math.min(roll1, roll2);
        note += " (Disadvantage)";
    } else if (advantage && hasDisadvantage) {
        finalRoll = roll1; // Cancel
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

/**
 * Generates a scaled stat block for an NPC based on a target level.
 * @param {object} template - The combatStats object from an NPC.
 * @param {number} targetLevel - The desired level for the stats.
 * @returns {object} A complete, scaled stat block for combat.
 */
export function generateScaledStats(template, targetLevel) {
    // Deep copy the base stats to avoid modifying the original template
    const stats = JSON.parse(JSON.stringify(template.base));

    const baseLevel = template.base.level;
    if (targetLevel <= baseLevel) {
        return stats; // No scaling needed, return base stats
    }

    const levelDifference = targetLevel - baseLevel;
    stats.level = targetLevel;

    // --- HP Scaling ---
    // Roll HP for each level gained
    for (let i = 0; i < levelDifference; i++) {
        const hpRoll = rollDiceExpression(template.perLevel.hp);
        stats.hp += hpRoll.total;
    }

    // --- To-Hit and Damage Scaling ---
    const totalToHitBonus = Math.floor(levelDifference * (template.perLevel.toHit || 0));
    const totalDamageBonus = Math.floor(levelDifference * (template.perLevel.damage || 0));

    if (stats.actions && (totalToHitBonus > 0 || totalDamageBonus > 0)) {
        stats.actions.forEach(action => {
            if (action.type === 'attack') {
                // Scale To-Hit
                if (action.toHit) {
                    action.toHit += totalToHitBonus;
                }

                // Scale Damage
                if (action.damage) {
                    const regex = /(\d+d\d+)([+-]\d+)?/;
                    const match = action.damage.match(regex);
                    if (match) {
                        const baseDie = match[1];
                        const modifier = match[2] ? parseInt(match[2]) : 0;
                        const newModifier = modifier + totalDamageBonus;

                        if (newModifier > 0) {
                            action.damage = `${baseDie}+${newModifier}`;
                        } else if (newModifier < 0) {
                            action.damage = `${baseDie}${newModifier}`; // e.g., 1d6-1
                        } else {
                            action.damage = baseDie; // No modifier
                        }
                    }
                }
            }
        });
    }

    return stats;
}
